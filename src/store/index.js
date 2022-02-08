import { createStore } from 'vuex'
import { parse } from "@vanillaes/csv";
import { DataFrame } from "danfojs";
import { db } from "/db";

function slope(df) {
    let max = df.values[0][1];
    let timestampMax = df.values[0][0];
    let min = df.values[0][1];
    let timestampMin = df.values[0][0];
    const values = df.values;
    for (let i = 1; i < values.length; i++) {
        if (values[i][1] > max) {
            max = values[i][1];
            timestampMax = values[i][0];
        }
        if (values[i][1] < min) {
            min = values[i][1];
            timestampMin = values[i][0];
        }
    }
    let slope = 0;
    if (timestampMax != timestampMin) {
        slope = (max - min) / (timestampMax - timestampMin);
    }
    return [timestampMax, slope];
}

export default createStore({
    state: {
        data: [],
        currentSelectedData: 0,
        activeLabel: null,
        areaVisible: false,
        colors: ["red", "orange", "#FFD700", "olive", "green", "teal", "blue", "violet", "purple", "pink", "brown", "grey"],
    },
    mutations: {
        addData: async (state, payload) => {
            let data = parse(payload.result);
            let legende = data.shift();
            let timestamps = [];
            let dataJson = [];

            // Get Timestamps
            let timestampLocation = -1;
            for(let i = 0; i < legende.length; i++){
                if(legende[i].toLowerCase() == "timestamp"){
                    timestampLocation = i;
                }
                else {
                    dataJson.push({
                        id: i,
                        name: legende[i],
                        dataPoints: [],
                        color: state.colors[i % state.colors.length],
                    });
                }
            }
            if(timestampLocation >= 0){
                data.forEach(row => {
                    timestamps.push(new Date(row[timestampLocation]).getTime());
                    row.splice(timestampLocation, 1);
                });
            
                // Get dimensions in own arrays
                for(let row = 0; row < data.length; row++){
                    for(let column = 0; column < data[row].length; column++){
                        dataJson[column].dataPoints.push([new Date(timestamps[row]).getTime(), data[row][column]]);   
                    }
                }
                state.data.push({
                    id: state.data.length,
                    name: payload.name,
                    dataPoints: dataJson,
                    timestamps: timestamps,
                    selectedAxes: [dataJson[0].id],
                });
            }
        },
        testDanfo: (state) => {
            const samplingrate = 8;
            const data = state.data[0].dataPoints[0].dataPoints;
            let df = new DataFrame(data);
            //df.drop({ columns: ["0"], inplace: true })
            df = df.asType("1", "float32");
            const timestamps = state.data[0].timestamps;
            let segmentlengths = [];
            let timestamp = timestamps[0];
            let timestapplus = timestamp + 1000;
            let i = 0;
            while(i < data.length){
                let dataCount = 0;
                while(timestamp < timestapplus){
                    i++;
                    dataCount++;
                    timestamp = timestamps[i];
                }
                let segmentlength = Math.floor(dataCount / samplingrate);
                let remainder = dataCount % samplingrate;
                for(let i = 0; i < samplingrate; i++){
                    if(remainder > 0){
                        segmentlengths.push(segmentlength + 1);
                        remainder--;
                    }
                    else{
                        segmentlengths.push(segmentlength);
                    }
                }
                timestapplus = timestamp + 1000;
            }
            let max = [];
            let min = [];
            let mean = [];
            let median = [];
            let std = [];
            let varianz = [];
            let slopes = [];
            let oldsegment = 0;
            segmentlengths.forEach(segment => {
                segment = oldsegment + segment;
                let newFrame = df.iloc({rows: [oldsegment.toString() + ":" + segment.toString()]});
                max.push([timestamps[segment], newFrame.max({ axis: 0 }).values[1]]);
                min.push([timestamps[segment], newFrame.min({ axis: 0 }).values[1]]);
                mean.push([timestamps[segment], newFrame.mean({ axis: 0 }).values[1]]);
                median.push([timestamps[segment], newFrame.median({ axis: 0 }).values[1]]);
                std.push([timestamps[segment], newFrame.std({ axis: 0 }).values[1]]);
                varianz.push([timestamps[segment], newFrame.var({ axis: 0 }).values[1]]);
                const slopeArray = slope(newFrame);
                // console.log(slopeArray)
                slopes.push([slopeArray[0], slopeArray[1]]);
                oldsegment = segment;
            })
            state.data[0].dataPoints.push({
                id: "max",
                name: "Max",
                dataPoints: max,
                color: "black",
            });
            state.data[0].dataPoints.push({
                id: "min",
                name: "Min",
                dataPoints: min,
                color: "green",
            });
            state.data[0].dataPoints.push({
                id: "mean",
                name: "Mean",
                dataPoints: mean,
                color: "blue",
            });
            state.data[0].dataPoints.push({
                id: "median",
                name: "Median",
                dataPoints: median,
                color: "orange",
            });
            state.data[0].dataPoints.push({
                id: "std",
                name: "Std",
                dataPoints: std,
                color: "red",
            });
            state.data[0].dataPoints.push({
                id: "var",
                name: "Var",
                dataPoints: varianz,
                color: "brown",
            });
            state.data[0].dataPoints.push({
                id: "slope",
                name: "Slope",
                dataPoints: slopes,
                color: "purple",
            });
            state.data[0].selectedAxes.push("max");
            state.data[0].selectedAxes.push("min");
            state.data[0].selectedAxes.push("mean");
            state.data[0].selectedAxes.push("median");
            state.data[0].selectedAxes.push("std");
            state.data[0].selectedAxes.push("var");
            state.data[0].selectedAxes.push("slope");
            console.log(state.data[0]);
        },
        addAnnotationData: async (state, payload) => {
            let data = parse(payload.result);
            let legende = data.shift();
            let lastAnn = {};

            let anno = await db.annotations.add({
                name: payload.name,
                lastAdded: lastAnn,
            })

            // Get Timestamp and Label location
            let timestampLocation = -1;
            let labelLocation = -1;
            for(let i = 0; i < legende.length; i++){
                if(legende[i].toLowerCase() == "timestamp"){
                    timestampLocation = i;
                }
                else if(legende[i].toLowerCase() == "label"){
                    labelLocation = i;
                }
            }

            for(let i = 0; i < data.length; i++){
                let label = await db.labels.where('[annoId+name]').equals([anno, data[i][labelLocation]]).toArray();
                if(label.length === 0){
                    label = await db.labels.add({
                        name: data[i][labelLocation],
                        color: state.colors[i % state.colors.length],
                        annoId: anno,
                    })
                }
                else{
                    label = label[0].id;
                }
                const newAnn = await db.annoData.add({
                    labelId: label,
                    annoId: anno,
                    timestamp: new Date(data[i][timestampLocation]).getTime(),
                });
                lastAnn = newAnn;
            }
            await db.lastSelected.put({id: 1, annoId: anno});
            anno = await db.annotations.update(anno, {lastAdded: lastAnn})
        },
        addNewAnnotationFile: (state, fileName) => {
            state.annotations.push({
                id: state.annotations.length,
                name: fileName + ".csv",
                data: [],
                labels: {},
                lastAddedAnnotation: {},
            });
        },
        addAnnotationPoint: (state, timestamp) => {
            if(state.activeLabel != null){
                let time = new Date(timestamp).getTime();
                let annotations = state.annotations[state.currAnn].data;
                let inserted = false;
                let lastAddedAnnotation = state.annotations[state.currAnn].lastAddedAnnotation;
                if (annotations.length == 0) {
                    const newAnn = {
                        id: 0,
                        label: state.activeLabel.id,
                        timestamp: time,
                    };
                    annotations.push(newAnn);
                    state.annotations[state.currAnn].lastAddedAnnotation = newAnn;
                    return;
                }

                const newAnn = {
                    id: lastAddedAnnotation.id +1,
                    label: state.activeLabel.id,
                    timestamp: time,
                };
                state.annotations[state.currAnn].lastAddedAnnotation = newAnn;
                for(let i = 0; i < annotations.length; i++){
                    if(annotations[i].timestamp > time){
                        annotations.splice(i, 0, newAnn);
                        inserted = true;
                        break;
                    }
                }
                if(!inserted){
                    annotations.push(newAnn);
                }
            }
        },
        addSelectedAxes: (state, axis) => {
            state.data[state.currentSelectedData].selectedAxes.push(axis.id);
        },
        deleteSelectedAxis(state, axis) {
            let selectedAxes = state.data[state.currentSelectedData].selectedAxes;
            const index = selectedAxes.indexOf(axis.id);
            if (index > -1) {
                selectedAxes.splice(index, 1);
            }
        },
        changeAxisColor(state, changedAxis) {
            let axes = state.data[state.currentSelectedData].dataPoints;
            for (let i in axes) {
                if (axes[i].id === changedAxis.id) {
                    axes[i].color = changedAxis.color;
                    break;
                }
            }
        },
        toggleActiveLabel(state, label) {
            state.activeLabel = label;
        },
        selectDataFile(state, dataFileId){
            state.currentSelectedData = dataFileId;
        },
        toggleAreaVisibility (state) {
            console.log("enter: ", state.areaVisible);
            state.areaVisible = !state.areaVisible;
            console.log("after: ", state.areaVisible);
        }
    },
    getters: {
        getData: state => {
            if(state.data?.length > 0){
                return state.data[state.currentSelectedData].dataPoints.filter(key => state.data[state.currentSelectedData].selectedAxes.includes(key.id));
            }
            return [];
        },
        getAxes: state => {
            if(state.data?.length > 0){
                return state.data[state.currentSelectedData].dataPoints;
            }
            return [];
        },
        timestamps: state => {
            if(state.data?.length > 0){
                return state.data[state.currentSelectedData].timestamps;
            }
            return [];
        },
        selectedAxes: state => {
            if(state.data?.length > 0){
                return state.data[state.currentSelectedData].selectedAxes;
            }
            return [];
        },
        showGraph: state => {
            if(state.data?.length > 0){
                return true;
            }
            else {
                return false;
            }
        }
    },
})
