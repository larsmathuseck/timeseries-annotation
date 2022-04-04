import { createStore } from 'vuex';
import mutations from './mutations';
import getters from './getters';

export default createStore({
    state: {
        data: {},
        selectedData: null,
        activeLabel: null,
        areasVisible: false,
        colors: ["red", "orange", "olive", "green", "teal", "blue", "violet", "purple", "pink", "brown", "grey"],
    },
    mutations,
    getters,
});
