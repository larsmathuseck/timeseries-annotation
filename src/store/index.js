import { createStore } from 'vuex'
import { parse } from "@vanillaes/csv";

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
                        color: state.colors[Math.floor(Math.random() * state.colors.length)],
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
            console.log(state.data)
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
                    timestamp: new Date(data[i][timestampLocation]).getTime(),
                });
            }

            state.annotations.push({
                id: state.annotations.length,
                name: payload.name,
                data: dataArray,
                labels: labels,
            });
        },
        addAnnotationPoint: (state, timestamp) => {
            if(state.activeLabel != null){
                let time = new Date(timestamp).getTime();
                let annotations = state.annotations[state.currAnn].data;
                let newAnn = {
                    id: annotations[annotations.length-1].id +1,
                    label: state.activeLabel.id,
                    timestamp: time,
                }
                for(let i = 0; i < annotations.length; i++){
                    if(annotations[i].timestamp > time){
                        annotations.splice(i, 0, newAnn);
                        break;
                    }
                }
            }
        },
        addSelectedAxes: (state, axis) => {
            state.data[state.currentSelectedData].selectedAxes.push(axis.id);
        },
        deleteSelectedAxis(state, axis) {
            let selectedAxes = state.data[state.currentSelectedData].selectedAxes;
            const index = selectedAxes.indexOf(axis.id)
            if (index > -1) {
                selectedAxes.splice(index, 1)
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
            state.activeLabel = label;
        },
        deleteLabel(state, label) {
            let labels = state.annotations[state.currAnn].labels;
            const key = Object.keys(labels).find(key => labels[key] === label);
            this.commit("deleteAnnotationsWithLabel", key);
            delete labels[key];
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
                console.log("delete anno: ", annotation)
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
            for (let index in annotations) {
                if (annotations[index].label == labelNumber) {
                    console.log("anno found: ", annotations[index])
                    this.commit("deleteAnnotation", annotations[index])
                }
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
