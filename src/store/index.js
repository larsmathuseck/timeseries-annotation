import { createStore } from 'vuex'
import { parse } from "@vanillaes/csv";

export default createStore({
    state: {
        data: [],
        timestamps: [],
        selectedAxes: [],
        annotations: [
            {
                id: 1,
                label: 1,
                timestamp: "2019-07-12 12:08:27.872"
            },
            {
                id: 2,
                label: 2,
                timestamp: "2019-07-12 12:08:27.872"
            },
            {
                id: 3,
                label: 3,
                timestamp: "2019-07-12 12:08:27.872"
            },
            {
                id: 4,
                label: 4,
                timestamp: "2019-07-12 12:08:27.872"
            },
            {
                id: 5,
                label: 1,
                timestamp: "2019-07-12 12:08:27.872"
            },
        ],
        //labels: [],
        labels: {
            1: {
                id: 1,
                name: "openOrClosed",
                color: "red",
            },
            2: {
                id: 2,
                name: "tilted_opening",
                color: "orange",
            },
            3: {
                id: 3,
                name: "tilted",
                color: "yellow",
            },
            4: {
                id: 4,
                name: "tilted_closing",
                color: "teal",
            },
            5: {
                id: 5,
                name: "end",
                color: "green",
            },
        },
        activeLabel: Object,
    },
    mutations: {
        loadData: (state, csvData) => {
            let data = parse(csvData);
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
                        color: "#000000",
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
                state.data = dataJson;
                state.timestamps = timestamps;
                state.selectedAxes.push(dataJson[0].id);
            }
        },
        addSelectedAxes: (state, axis) => {
            state.selectedAxes.push(axis.id);
        },
        deleteSelectedAxis(state, axis) {
            if (state.selectedAxes.length <= 1) {
                alert("At least 1 axis must be selected!");
                return;
            }
            const index = state.selectedAxes.indexOf(axis.id);
            if (index > -1) {
                state.selectedAxes.splice(index, 1);
            }
        },
        addLabel(state, label) {
            const labelNumber = label.id;
            state.labels[labelNumber] = label;
        },
        toggleActiveLabel(state, label) {
            state.activeLabel = label;
        },
        deleteLabel(state, label) {
            let labels = state.labels;
            const key = Object.keys(labels).find(key => labels[key] === label);
            this.commit("deleteAnnotationsWithLabel", key);
            delete labels[key];
        },
        deleteAnnotation(state, annotation) {
            const index = state.annotations.indexOf(annotation);
            if (index > -1) {
                state.annotations.splice(index, 1);
            }
        },
        deleteAnnotationsWithLabel(state, labelKey) {
            let annotations = state.annotations;
            for (let key in annotations) {
                if (annotations[key].label == labelKey) {
                    this.commit("deleteAnnotation", annotations[key])
                }
            }

        }
    },
    getters: {
        getData: state => {
            return state.data.filter(key => state.selectedAxes.includes(key.id));
        },
        getAnnotaions: state => {
            let data = [];
            let annotations = state.annotations;
            let labels = state.labels;
            for(let key in annotations){
                data.push({
                    id: annotations[key].id,
                    timestamp: annotations[key].timestamp,
                    name: labels[annotations[key].label].name,
                    color: labels[annotations[key].label].color,
                    annotationObject: annotations[key],
                })
            }
            return data;
        }
    },
    modules: {

    },
})
