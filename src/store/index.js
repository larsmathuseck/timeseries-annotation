import { createStore } from 'vuex'
import { parse } from "@vanillaes/csv";

export default createStore({
    state: {
        data: [],
        currentSelectedData: 0,
        annotations: [],
        currAnn: 0,
        activeLabel: Object,
        colors: ["red", "orange", "#FFD700", "olive", "green", "teal", "blue", "violet", "purple", "pink", "brown", "grey"],
        //annotationLabels: [],
        annotationLabels: [
            {
                id: 1,
                name: "openOrClosed",
                color: "red",
                timestamp: "12:08:28",
            },
            {
                id: 2,
                name: "tilted_opening",
                color: "orange",
                timestamp: "12:08:32",
            },
            {
                id: 3,
                name: "tilted",
                color: "yellow",
                timestamp: "12:08:32",
            },
            {
                id: 4,
                name: "tilted_closing",
                color: "green",
                timestamp: "12:08:35",
            },
            {
                id: 5,
                name: "openOrClosed",
                color: "red",
                timestamp: "12:08:36",
            },
        ],
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
                        color: state.colors[Math.floor(Math.random() * state.colors.length)],
                    });
                }
            }
            if(timestampLocation >= 0){
                data.forEach(row => {
                    timestamps.push(row[timestampLocation]);
                    row.splice(timestampLocation, 1);
                });
            
                // Get dimensions in own arrays
                for(let row = 0; row < data.length; row++){
                    for(let column = 0; column < data[row].length; column++){
                        dataJson[column].dataPoints.push([timestamps[row], data[row][column]]);   
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
        addAnnotationData: (state, payload) => {
            let data = parse(payload.result);
            let legende = data.shift();
            let labels = {};
            let newestLabelId = 0;
            let dataArray = [];

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
                        color: state.colors[Math.floor(Math.random() * state.colors.length)],
                    }
                    labels[`${newestLabelId}`] = label;
                    newestLabelId += 1;
                }
                dataArray.push({
                    id: i,
                    label: label.id,
                    timestamp: data[i][timestampLocation],
                });
            }

            state.annotations.push({
                id: state.annotations.length,
                name: payload.name,
                data: dataArray,
                labels: labels,
            });
        },
        addSelectedAxes: (state, axis) => {
            state.data[state.currentSelectedData].selectedAxes.push(axis.id);
        },
        deleteSelectedAxis(state, axis) {
            let selectedAxes = state.data[state.currentSelectedData].selectedAxes;
            if (selectedAxes.length <= 1) {
                alert("At least 1 axis must be selected!")
                return;
            }
            const index = selectedAxes.indexOf(axis.id)
            if (index > -1) {
                selectedAxes.splice(index, 1)
            }
        },
        addLabel(state, label) {
            state.annotations[state.currAnn].labels.push(label);
        },
        toggleActiveLabel(state, label) {
            state.activeLabel = label;
        },
        deleteAnnotationLabel(state, annotationLabel) {
            const index = state.annotationLabels.indexOf(annotationLabel);
            if (index > -1) {
                state.annotationLabels.splice(index, 1);
            }
        },
        selectDataFile(state, dataFileId){
            state.currentSelectedData = dataFileId;
        },
        selectAnnotationFile(state, annotationFileId){
            state.currAnn = annotationFileId;
        }
    },
    getters: {
        getData: state => {
            if(state.data.length > 0){
                return state.data[state.currentSelectedData].dataPoints.filter(key => state.data[state.currentSelectedData].selectedAxes.includes(key.id));
            }
            return [];
        },
        getAnnotaions: state => {
            let data = [];
            let annotations = state.annotations[state.currAnn];
            let labels = annotations?.labels;
            for(let key in annotations?.data){
                data.push({
                    id: annotations.data[key].id,
                    timestamp: annotations.data[key].timestamp,
                    name: labels[annotations.data[key].label].name,
                    color: labels[annotations.data[key].label].color,
                })
            }
            return data;
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
        }
    },
    modules: {

    },
})
