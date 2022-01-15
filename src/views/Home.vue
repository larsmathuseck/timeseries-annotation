<template>
    <div class="container-fluid d-flex h-100 flex-column">
        <Header title="TF Annotator" />
        <div class="row h-100" id="main-row">
            <div class="col col-lg-2 col-md-2 col-sm-12 col-12">
                <LeftSidebar/>
            </div>
            <div class="col col-lg-8 col-md-8 col-sm-12 col-12">
                <div class="graphDiv">
                    <graph ref="graphRef" v-if="showGraph" class="chart" />
                </div>
            </div>
            <div class="col col-lg-2 col-md-2 col-sm-12 col-12">
                <RightSidebar />
            </div>
        </div>
    </div>
</template>

<script>
import graph from "../components/Graph.vue"
import Header from "./Header.vue"
import LeftSidebar from "../components/LeftSidebar.vue"
import RightSidebar from "../components/RightSidebar.vue"
import * as tf from '@tensorflow/tfjs';

export default {  
    name: "Home",
    components: {
        graph,
        Header,
        LeftSidebar,
        RightSidebar,
    },
    data() {
        return {
            acceptedKeys: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
        }
    },
    computed: {
        showGraph: function(){
            return this.$store.getters.showGraph;
        }
    },
    methods: {
        keyPressed: function(e) {
            let key = e.key;
            if (this.acceptedKeys.indexOf(key) > -1) {
                if (key == 0) { // modify key so that by pressing 1 its the first label, which has index 0, and by pressing 0 you reach label 10
                    key = 10;
                } else {
                    key -= 1;
                }
                this.$store.commit("toggleActiveLabelByKey", key);
            }
        }
    },
    mounted: function() {
        window.addEventListener("keypress", this.keyPressed);
    },
    beforeUnmount: function() {
        window.removeEventListener('keypress', this.keyPressed);
    },
    created: async function() {
        tf.serialization.registerClass(L2);
        await tf.loadLayersModel('model/model.json').then((model) => modelLoaded(model));
        
        function modelLoaded(model){
            const instance = [[[-3.3523560e-02,  9.8258060e+00, -3.1604004e-01, -4.2724610e-04, 2.6702880e-03, -4.4250488e-04],
                                [-4.7882080e-02,  9.8162230e+00, -1.3407898e-01,  1.6937256e-03, -5.1879880e-04,  6.2561035e-04],
                                [-4.3090820e-02,  9.8210140e+00, -1.9154358e-01, -1.4953613e-03, -1.5869141e-03, -4.4250488e-04],
                                [-3.8314820e-02,  9.8162230e+00, -8.6196900e-02, -1.4953613e-03, -1.5869141e-03, -1.5106201e-03],
                                [-3.8314820e-02,  9.8210140e+00, -1.5322876e-01, -1.4953613e-03, -5.1879880e-04, -4.4250488e-04],
                                [-3.3523560e-02,  9.8162230e+00, -4.3090820e-02, -4.2724610e-04, -1.5869141e-03,  6.2561035e-04],
                                [-3.8314820e-02,  9.8210140e+00, -3.3523560e-02, -2.5634766e-03,  1.6174316e-03, -4.4250488e-04],
                                [-3.3523560e-02,  9.8210140e+00, -4.7912598e-03,  6.4086914e-04, -5.1879880e-04, -4.4250488e-04],
                                [-2.8732300e-02,  9.8258060e+00, -6.2255860e-02, -4.2724610e-04, 5.4931640e-04, -4.4250488e-04],
                                [-3.3523560e-02,  9.8258060e+00, -5.7464600e-02,  6.4086914e-04, 5.4931640e-04,  6.2561035e-04],
                                [-3.8314820e-02,  9.8210140e+00, -7.6614380e-02, -4.2724610e-04, 5.4931640e-04, -4.4250488e-04],
                                [-3.3523560e-02,  9.8258060e+00, -1.0534668e-01,  6.4086914e-04, -1.5869141e-03,  6.2561035e-04],
                                [-3.8314820e-02,  9.8210140e+00, -1.3887024e-01, -4.2724610e-04, 5.4931640e-04, -4.4250488e-04],
                                [-3.8314820e-02,  9.8210140e+00, -1.1492920e-01, -4.2724610e-04, 5.4931640e-04,  6.2561035e-04],
                                [-3.8314820e-02,  9.8210140e+00, -1.6758728e-01, -4.2724610e-04, -5.1879880e-04,  6.2561035e-04],
                                [-4.3090820e-02,  9.8210140e+00, -1.2449646e-01,  6.4086914e-04, -5.1879880e-04, -4.4250488e-04],
                                [-4.7882080e-02,  9.8258060e+00, -1.3887024e-01, -1.4953613e-03, -1.5869141e-03, -4.4250488e-04],
                                [-3.3523560e-02,  9.8258060e+00, -1.1013794e-01, -1.4953613e-03, -1.5869141e-03,  6.2561035e-04],
                                [-4.3090820e-02,  9.8210140e+00, -6.7031860e-02, -1.4953613e-03, -5.1879880e-04,  6.2561035e-04],
                                [-4.3090820e-02,  9.8210140e+00, -8.1405640e-02,  6.4086914e-04, -5.1879880e-04, -1.5106201e-03],
                                [-2.8732300e-02,  9.8258060e+00, -8.1405640e-02, -4.2724610e-04, 5.4931640e-04, -4.4250488e-04],
                                [-4.3090820e-02,  9.8210140e+00, -9.0972900e-02,  6.4086914e-04, 5.4931640e-04,  6.2561035e-04],
                                [-3.3523560e-02,  9.8210140e+00, -8.1405640e-02,  6.4086914e-04, -5.1879880e-04,  6.2561035e-04],
                                [-3.3523560e-02,  9.8305970e+00, -1.1492920e-01, -4.2724610e-04, -5.1879880e-04, -4.4250488e-04],
                                [-2.8732300e-02,  9.8162230e+00, -1.1492920e-01, -4.2724610e-04, 5.4931640e-04,  6.2561035e-04],
                                [-3.8314820e-02,  9.8258060e+00, -1.2449646e-01,  6.4086914e-04, 5.4931640e-04,  6.2561035e-04],
                                [-3.3523560e-02,  9.8162230e+00, -1.0534668e-01, -4.2724610e-04, 5.4931640e-04, -4.4250488e-04],
                                [-3.3523560e-02,  9.8210140e+00, -1.0055542e-01,  6.4086914e-04, -5.1879880e-04, -4.4250488e-04],
                                [-2.8732300e-02,  9.8162230e+00, -1.0055542e-01,  6.4086914e-04, 5.4931640e-04, -4.4250488e-04],
                                [-3.3523560e-02,  9.8114320e+00, -1.1013794e-01, -4.2724610e-04, 5.4931640e-04, -4.4250488e-04],
                                [-3.8314820e-02,  9.8210140e+00, -1.0534668e-01,  1.6937256e-03, -5.1879880e-04,  6.2561035e-04],
                                [-3.3523560e-02,  9.8258060e+00, -1.1492920e-01, -4.2724610e-04, -5.1879880e-04,  6.2561035e-04]]]
                                
            const tensor = tf.tensor(instance);
            let a = model.predict(tensor);
            console.log(a.print());
        }
    }
};

class L2 {

    static className = 'L2';

    constructor(config) {
        return tf.regularizers.l1l2(config)
    }
}
</script>

<style scoped>
.graphDiv {
    height: 100%;
}

#main-row {
    padding-top: 20px;
}
</style>
