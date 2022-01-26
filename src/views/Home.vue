<template>
    <div class="container-fluid d-flex h-100 flex-column">
        <Header title="TF Annotator" />
        <div class="row h-100" id="main-row">
            <div class="col col-lg-2 col-md-2 col-sm-12 col-12">
                <LeftSidebar/>
            </div>
            <div class="col col-lg-8 col-md-8 col-sm-12 col-12">
                <div class="graphDiv">
                    <Graph ref="graphRef" v-if="showGraph" class="chart" />
                </div>
            </div>
            <div class="col col-lg-2 col-md-2 col-sm-12 col-12">
                <RightSidebar />
            </div>
        </div>
    </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
const Graph = defineAsyncComponent(() => import("@/components/Graph.vue"))
import Header from "./Header.vue"
import LeftSidebar from "../components/LeftSidebar.vue"
import RightSidebar from "../components/RightSidebar.vue"

export default {  
    name: "Home",
    components: {
        Graph,
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
};
</script>

<style scoped>
.graphDiv {
    height: 100%;
}

#main-row {
    padding-top: 20px;
}
</style>
