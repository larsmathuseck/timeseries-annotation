import { createStore } from 'vuex'
import { parse } from "@vanillaes/csv";

export default createStore({
    state: {
        data: [],
        timestamps: [],
        selectedAxes: []
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
    },
    getters: {
        getData: state => {
            return state.data.filter(key => state.selectedAxes.includes(key.id));
        }
    },
    modules: {

    }
})
