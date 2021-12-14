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


export default {  
    name: "Home",
    components: {
        graph,
        Header,
        LeftSidebar,
        RightSidebar,
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

#main-row {
    padding-top: 20px;
}
</style>
