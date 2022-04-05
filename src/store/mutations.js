import { parse } from "@vanillaes/csv";
import { breakDownToSamplingrate } from '../util/model/ModelInstances';

export default {
    addData: (state, payload) => {
        let data = parse(payload.result);
        let legende = data.shift();
        let timestamps = [];
        let axes = {};

        // Get Timestamps and create axes object
        let timestampLocation = -1;
        let axesId = 0;
        for(let i = 0; i < legende.length; i++) {
            if(legende[i].toLowerCase() == "timestamp") {
                timestampLocation = i;
            }
            else {
                Object.assign(axes, {[axesId]: {
                    id: axesId,
                    name: legende[i],
                    dataPoints: [],
                    color: state.colors[i % state.colors.length],
                }});
                axesId += 1;
            }
        }
        if(timestampLocation >= 0) {
            data.forEach(row => {
                timestamps.push(new Date(row[timestampLocation]).getTime());
                row.splice(timestampLocation, 1);
            });
            
            // Delete last not full second
            const lastTimestamp = (timestamps[timestamps.length-1] - (timestamps[timestamps.length-1] - timestamps[0])%1000);
            let time = timestamps[timestamps.length-1];
            while(time > lastTimestamp) {
                if(timestamps[timestamps.length-2] <= lastTimestamp) {
                    break;
                }
                time = timestamps.pop();
            }
            // Get dimensions in own arrays
            for(let row = 0; row < timestamps.length; row++) {
                for(let column = 0; column < data[row].length; column++) {
                    axes[column].dataPoints.push([new Date(timestamps[row]).getTime(), data[row][column]]);   
                }
            }
            let id = 0;
            if(Object.keys(state.data).length > 0) {
                const keys = Object.keys(state.data);
                id = parseInt(keys[keys.length-1]) + 1;
            }
            Object.assign(state.data, {[id]: {
                id: id,
                name: payload.name,
                axes: axes,
                timestamps: timestamps,
                selectedAxes: [parseInt(Object.keys(axes)[0])],
            }});
            state.selectedData = id;
        }
    },
    deleteData: (state) => {
        delete state.data[state.selectedData];
        if (Object.keys(state.data).length > 0) {
            state.selectedData = parseInt(Object.keys(state.data)[0]);
        }
        else {
            state.selectedData = null;
        }
    },
    addAxis: (state, payload) => {
        const axes = state.data[state.selectedData].axes;
        const axisData = axes[payload.axis.id].dataPoints;
        let data = breakDownToSamplingrate([axisData], state.data[state.selectedData].timestamps, payload.samplingRate, payload.feature.id);
        data = data[1].map((x) => { return [data[0][data[1].indexOf(x)], x[0]]; });
        const keys = Object.keys(axes);
        const id = parseInt(keys[keys.length-1]) + 1;
        const axis = {
            id: id,
            name: payload.name,
            dataPoints: data,
            color: payload.color,
            samplingRate: payload.samplingRate,
            feature: payload.feature, 
        };
        Object.assign(axes, {[id]: axis});
        state.data[state.selectedData].selectedAxes.push(axis.id);
    },
    updateAxis: (state, payload) => {
        state.data[state.selectedData].axes[payload.id].name = payload.name;
        state.data[state.selectedData].axes[payload.id].color = payload.color;
    },
    deleteAxis: (state, payload) => {
        delete state.data[state.selectedData].axes[payload.id];
        let selectedAxes = state.data[state.selectedData].selectedAxes;
        const axes = state.data[state.selectedData].axes;
        if(selectedAxes.length == 1 && selectedAxes[0] == payload.id) {
            const id = Object.keys(axes)[0];
            selectedAxes.push(parseInt(id));
        }
        if (selectedAxes.indexOf(payload.id) > -1) {
            selectedAxes.splice(selectedAxes.indexOf(payload.id), 1);
        }
    },
    addSelectedAxes: (state, axis) => {
        state.data[state.selectedData].selectedAxes.push(axis.id);
    },
    deleteSelectedAxis: (state, axis) => {
        let selectedAxes = state.data[state.selectedData].selectedAxes;
        const index = selectedAxes.indexOf(axis.id);
        if (index > -1) {
            selectedAxes.splice(index, 1);
        }
    },
    toggleActiveLabel: (state, label) => {
        state.activeLabel = label;
    },
    selectDataFile: (state, dataFileId) => {
        state.selectedData = dataFileId;
    },
    toggleAreasVisibility: (state) => {
        state.areasVisible = !state.areasVisible;
    },
};