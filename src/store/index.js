import { createStore } from 'vuex'
import { parse } from "@vanillaes/csv";

export default createStore({
    state: {
        data: [],
        timestamps: [],
        legende: [],
        selectedAxes: [],
        //labels: [],
        labels: [
            {
                id: 1,
                name: "openOrClosed",
                color: "red",
            },
            {
                id: 2,
                name: "tilted_opening",
                color: "orange",
            },
            {
                id: 3,
                name: "tilted",
                color: "yellow",
            },
            {
                id: 4,
                name: "tilted_closing",
                color: "teal",
            },
            {
                id: 5,
                name: "end",
                color: "green",
            },
        ],
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
            let dataArray = [];

            // Get Timestamps
            let timestampLocation = -1;
            for(let i = 0; i < legende.length; i++){
                if(legende[i].toLowerCase() == "timestamp"){
                legende.splice(i, 1);
                timestampLocation = i;
                break;
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
                    if(dataArray[column] === undefined){
                    dataArray[column] = [];
                    }
                    dataArray[column].push([timestamps[row], data[row][column]]);
                }
                }
                state.data = dataArray;
                state.timestamps = timestamps;
                state.legende = legende;
            }
        },
        addSelectedAxis: (state, lastSelectedAxis) => {
            console.log("in index.js, addSelectedAxis: ", lastSelectedAxis)
            const newSelectedAxisName = lastSelectedAxis.name;
            const iterator = state.selectedAxes.values();

            for (const axis of iterator) { // needed if only color change of existing axis
                if (axis.name === newSelectedAxisName) {
                    const index = state.selectedAxes.indexOf(axis)
                    if (index > -1) {
                        state.selectedAxes.splice(index, 1);
                    }
                }
            }
            state.selectedAxes.push(lastSelectedAxis);
        },
        deleteSelectedAxis(state, axis) {
            if (state.selectedAxes.length <= 1) {
                alert("At least 1 axis must be selected!")
                return;
            }
            const index = state.selectedAxes.indexOf(axis)
            if (index > -1) {
                state.selectedAxes.splice(index, 1)
            }
        },
        addLabel(state, label) {
            state.labels.push(label);
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
    actions: {

    },
    modules: {

    },
})
