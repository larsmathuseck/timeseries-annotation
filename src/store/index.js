import { createStore } from 'vuex'
import { parse, stringify } from "@vanillaes/csv";
import { DateTime } from "luxon";
import * as dfd from "danfojs";

export default createStore({
    state: {
        data: [],
        currentSelectedData: 0,
        annotations: [],
        currAnn: 0,
        activeLabel: null,
        colors: ["red", "orange", "#FFD700", "olive", "green", "teal", "blue", "violet", "purple", "pink", "brown", "grey"],
    },
    mutations: {
        addData: (state, payload) => {
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
            const testData = state.data[0].dataPoints[0].dataPoints;
            const timestamps = state.data[0].timestamps;
            let segmentlengths = [];
            let timestamp = timestamps[0];
            let timestapplus = timestamp + 1000;
            let i = 0;
            while(i < testData.length){
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
            console.log(segmentlengths);
            let result = [];
            segmentlengths.forEach(segment => {
                let data = testData.splice(0, segment);
                let df = new dfd.DataFrame(data);
                df.drop({ columns: ["0"], inplace: true })
                result.push(df.median({ axis: 0 }).values[0]);
            })
            console.log(result)
        },
        addAnnotationData: (state, payload) => {
            let data = parse(payload.result);
            let legende = data.shift();
            let labels = {};
            let newestLabelId = 0;
            let dataArray = [];
            let lastAnn = {};

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
                let label = null;
                for(let key in labels){
                    if(labels[key].name === data[i][labelLocation]){
                        label = labels[key];
                    }
                }
                if(label == null){
                    label = {
                        id: newestLabelId,
                        name: data[i][labelLocation],
                        color: state.colors[i % state.colors.length],
                    }
                    labels[`${newestLabelId}`] = label;
                    newestLabelId += 1;
                }
                const newAnn = {
                    id: i,
                    label: label.id,
                    timestamp: new Date(data[i][timestampLocation]).getTime(),
                };
                lastAnn = newAnn;
                dataArray.push(newAnn);
            }
            state.annotations.push({
                id: state.annotations.length,
                name: payload.name,
                data: dataArray,
                labels: labels,
                lastAddedAnnotation: lastAnn,
            });
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
        addLabel(state, label) {
            const labelNumber = label.id;
            state.annotations[state.currAnn].labels[labelNumber] = label;
        },
        editLabel(state, label) {
            const labelNumber = label.id;
            state.annotations[state.currAnn].labels[labelNumber] = label;
        },
        toggleActiveLabel(state, label) {
            // check if label isnt deleted already
            const labels = state.annotations[state.currAnn].labels;
            if (Object.keys(labels).indexOf((label.id).toString()) < 0) {
                state.activeLabel = null;
                return;
            }
            state.activeLabel = label;
        },
        toggleActiveLabelByKey(state, key) {
            const annotations = state.annotations[state.currAnn];
            if (annotations == undefined || annotations == null) {
                return;
            }
            const labels = state.annotations[state.currAnn].labels;
            if (labels == undefined || labels == null) {
                return;
            }
            const keys = Object.keys(labels);
            if (keys.length > 0 && keys.length > key) {
                key = keys[key];
                state.activeLabel = labels[key];
            }
        },
        deleteLabel(state, label) {
            let labels = state.annotations[state.currAnn].labels;
            const key = Object.keys(labels).find(key => labels[key] === label);
            this.commit("deleteAnnotationsWithLabel", key);
            delete state.annotations[state.currAnn].labels[key];
            if (state.activeLabel != null && label.id == state.activeLabel.id) {
                state.activeLabel = null;
            }
        },
        deleteAnnotation(state, annotation) {
            let index = -1;
            let annotations = state.annotations[state.currAnn].data;
            for(let i = 0; i < annotations.length; i++){
                if(annotations[i] === annotation){
                    index = i;
                    break;
                }
            }
            if (index > -1) {
                state.annotations[state.currAnn].data.splice(index, 1);
            }
        },
        selectDataFile(state, dataFileId){
            state.currentSelectedData = dataFileId;
        },
        selectAnnotationFile(state, annotationFileId){
            state.currAnn = annotationFileId;
        },
        deleteAnnotationsWithLabel(state, labelNumber) {
            let annotations = state.annotations[state.currAnn].data;
            let annotationsToDelete = [];
            for (let i = 0; i < annotations.length; i++) {
                if (annotations[i].label == labelNumber) {
                    annotationsToDelete.push(annotations[i]);
                }
            }
            for (let i = 0; i < annotationsToDelete.length; i++) {
                this.commit("deleteAnnotation", annotationsToDelete[i]);
            }
        }
    },
    getters: {
        getData: state => {
            if(state.data.length > 0){
                return state.data[state.currentSelectedData].dataPoints.filter(key => state.data[state.currentSelectedData].selectedAxes.includes(key.id));
            }
            return [];
        },
        getAnnotations: state => {
            let data = [];
            let annotations = state.annotations[state.currAnn];
            let labels = annotations?.labels;
            for(let key in annotations?.data){
                data.push({
                    id: annotations.data[key].id,
                    label: annotations.data[key].label,
                    timestamp: annotations.data[key].timestamp,
                    name: labels[annotations.data[key].label].name,
                    color: labels[annotations.data[key].label].color,
                    annotationObject: annotations.data[key],
                });
            }
            return data;
        },
        saveAnnotations: state => {
            let annotations = state.annotations[state.currAnn];
            let labels = annotations?.labels;
            let data = [["Timestamp", "Label"]];
            for(let key in annotations?.data){
                data.push([DateTime.fromMillis(annotations.data[key].timestamp).toFormat('yyyy-MM-dd hh:mm:ss.SSS'), labels[annotations.data[key].label].name]);
            }
            return stringify(data);
        },
        getAxes: state => {
            if(state.data.length > 0){
                return state.data[state.currentSelectedData].dataPoints;
            }
            return [];
        },
        timestamps: state => {
            if(state.data.length > 0){
                return state.data[state.currentSelectedData].timestamps;
            }
            return [];
        },
        selectedAxes: state => {
            if(state.data.length > 0){
                return state.data[state.currentSelectedData].selectedAxes;
            }
            return [];
        },
        getLabels: state => {
            return state.annotations[state.currAnn]?.labels;
        },
        showGraph: state => {
            if(state.data.length > 0){
                return true;
            }
            else {
                return false;
            }
        }
    },
    modules: {

    },
})
