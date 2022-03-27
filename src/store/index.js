import { createStore } from 'vuex';
import { parse } from "@vanillaes/csv";
import { db } from "/db";
import { breakDownToSamplingrate } from '../util/model/ModelInstances';

export default createStore({
    state: {
        data: [],
        downSamplingData: [],
        currentSelectedData: 0,
        currentSelectedDataIndex: 0,
        activeLabel: null,
        areasVisible: false,
        colors: ["red", "orange", "olive", "green", "teal", "blue", "violet", "purple", "pink", "brown", "grey"],
    },
    mutations: {
        addData: (state, payload) => {
            let data = parse(payload.result);
            let legende = data.shift();
            let timestamps = [];
            let axes = [];

            // Get Timestamps
            let timestampLocation = -1;
            for(let i = 0; i < legende.length; i++){
                if(legende[i].toLowerCase() == "timestamp"){
                    timestampLocation = i;
                }
                else {
                    axes.push({
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
                
                // Delete last not full second
                const lastTimestamp = (timestamps[timestamps.length-1] - (timestamps[timestamps.length-1] - timestamps[0])%1000);
                let time = timestamps[timestamps.length-1];
                while(time > lastTimestamp){
                    if(timestamps[timestamps.length-2] <= lastTimestamp){
                        break;
                    }
                    time = timestamps.pop();
                }
                
                // Get dimensions in own arrays
                for(let row = 0; row < timestamps.length; row++){
                    for(let column = 0; column < data[row].length; column++){
                        axes[column].dataPoints.push([new Date(timestamps[row]).getTime(), data[row][column]]);   
                    }
                }
                
                state.data.push({
                    id: state.data.length,
                    name: payload.name,
                    dataPoints: axes,
                    timestamps: timestamps,
                    selectedAxes: [axes[0].id],
                });
            }
        },
        deleteData: (state) => {
            const data = state.data;
            data.splice(state.currentSelectedDataIndex, 1);
            if (data.length > 0) {
                state.currentSelectedData = data[0].id;
                state.currentSelectedDataIndex = 0;
            }
        },
        addAxis: (state, payload) => {
            const axisData = state.data[state.currentSelectedDataIndex].dataPoints[payload.axis.id-1].dataPoints;
            let data = breakDownToSamplingrate([axisData], state.data[state.currentSelectedDataIndex].timestamps, payload.samplingRate, payload.feature.id);
            data = data[1].map((x) => { return [data[0][data[1].indexOf(x)], x[0]]; });
            const dataPoints = state.data[state.currentSelectedDataIndex].dataPoints;
            const axis = {
                id: dataPoints[dataPoints.length-1] +1,
                name: payload.name,
                dataPoints: data,
                color: payload.color,
                samplingRate: payload.samplingRate,
                feature: payload.feature, 
            };
            state.data[state.currentSelectedDataIndex].dataPoints.push(axis);
            state.data[state.currentSelectedDataIndex].selectedAxes.push(axis.id);
        },
        updateAxis: (state, payload) => {
            let axes = state.data[state.currentSelectedDataIndex].dataPoints;
            axes.forEach(axis => {
                if(axis.id == payload.id){
                    axis.name = payload.name;
                    axis.color = payload.color;
                }
            });
        },
        deleteAxis: (state, payload) => {
            let axes = state.data[state.currentSelectedDataIndex].dataPoints;
            if(axes.length > 1){
                const index = axes.indexOf(payload);
                axes.splice(index, 1);
            }
        },
        addAnnotationData: async (state, payload) => {
            let data = parse(payload.result);
            let legende = data.shift();
            let lastAnn = {};

            let anno = await db.annotations.add({
                name: payload.name,
                lastAdded: lastAnn,
            });

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
                    });
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
            anno = await db.annotations.update(anno, {lastAdded: lastAnn});
        },
        addSelectedAxes: (state, axis) => {
            state.data[state.currentSelectedDataIndex].selectedAxes.push(axis.id);
        },
        deleteSelectedAxis: (state, axis) => {
            let selectedAxes = state.data[state.currentSelectedDataIndex].selectedAxes;
            const index = selectedAxes.indexOf(axis.id);
            if (index > -1) {
                selectedAxes.splice(index, 1);
            }
        },
        changeAxisColor: (state, changedAxis) => {
            let axes = state.data[state.currentSelectedDataIndex].dataPoints;
            for (let i in axes) {
                if (axes[i].id === changedAxis.id) {
                    axes[i].color = changedAxis.color;
                    break;
                }
            }
        },
        toggleActiveLabel: (state, label) => {
            state.activeLabel = label;
        },
        selectDataFile: (state, dataFileId) => {
            state.currentSelectedData = dataFileId;
            for (let i = 0; i < state.data.length; i++) {
                if (state.data[i].id == dataFileId) {
                    state.currentSelectedDataIndex = i;
                    return;
                }
            }
        },
        toggleAreasVisibility: (state) => {
            state.areasVisible = !state.areasVisible;
        },
        setDownsamplingData: (state, data) => {
            state.downSamplingData = data;
        },
    },
    getters: {
        getData: state => {
            if(state.data?.length > 0){
                return state.data[state.currentSelectedDataIndex].dataPoints.filter(key => state.data[state.currentSelectedDataIndex].selectedAxes.includes(key.id));
            }
            return [];
        },
        getDownsamplingData: state => {
            return state.downSamplingData;
        },
        getAxes: state => {
            if(state.data?.length > 0){
                return state.data[state.currentSelectedDataIndex].dataPoints;
            }
            return [];
        },
        timestamps: state => {
            if(state.data?.length > 0){
                return state.data[state.currentSelectedDataIndex].timestamps;
            }
            return [];
        },
        selectedAxes: state => {
            if(state.data?.length > 0){
                return state.data[state.currentSelectedDataIndex].selectedAxes;
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
});
