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
            }
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
                alert("At least 1 axis must be selected!")
                return;
            }
            const index = state.selectedAxes.indexOf(axis.id)
            if (index > -1) {
                state.selectedAxes.splice(index, 1)
            }
        },
        addLabel(state, label) {
            const labelNumber = label.id
            state.labels[labelNumber] = label
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
                })
            }
            return data;
        }
    },
    modules: {

    },
})
