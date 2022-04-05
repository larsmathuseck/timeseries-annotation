export default {
    getData: state => {
        if(Object.keys(state.data).length > 0) {
            return Object.fromEntries(Object.entries(state.data[state.selectedData].axes).filter(key => state.data[state.selectedData].selectedAxes.includes(key[1].id)));
        }
        return [];
    },
    getAxes: state => {
        if(Object.keys(state.data).length > 0) {
            return state.data[state.selectedData].axes;
        }
        return [];
    },
    timestamps: state => {
        if(Object.keys(state.data).length > 0) {
            return state.data[state.selectedData].timestamps;
        }
        return [];
    },
    selectedAxes: state => {
        if(Object.keys(state.data).length > 0) {
            return state.data[state.selectedData].selectedAxes;
        }
        return [];
    },
    showGraph: state => {
        if(Object.keys(state.data).length > 0) {
            return true;
        }
        else {
            return false;
        }
    }
};