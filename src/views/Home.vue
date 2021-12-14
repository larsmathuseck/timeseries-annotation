<template>
    <div class="container-fluid">
        <Header title="TF Annotator" />
        <div class="row">
            <div class="col col-lg-2 col-md-2 col-sm-12 col-12">
                <LeftSightbar/>
            </div>
            <div class="col col-lg-8 col-md-8 col-sm-12 col-12">
                <div class="graphDiv">
                    <graph ref="graphRef" v-if="showGraph" class="chart" />
                </div>
            </div>
            <div class="col col-lg-2 col-md-2 col-sm-12 col-12">
                <RightSightbar />
            </div>
        </div>
    </div>
</template>

<script>
import graph from "../components/Graph.vue"
import Header from "./Header.vue"
import LeftSightbar from "../components/LeftSightbar.vue"
import RightSightbar from "../components/RightSightbar.vue"


export default {  
    name: "Home",
    components: {
        graph,
        Header,
        LeftSightbar,
        RightSightbar,
    },
    computed: {
        showGraph: function(){
            return this.$store.getters.showGraph;
        }
    }
};
</script>

<style scoped>
    .graphDiv {
        height: 100%;
    }
</style>
