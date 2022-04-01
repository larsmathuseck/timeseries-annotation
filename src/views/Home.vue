<template>
    <div class="container-fluid d-flex h-100 flex-column">
        <Header title="TF Annotator" />
        <div class="row h-100 mt-2">
            <div class="col col-lg-2 col-md-2 col-sm-12 col-12">
                <LeftSidebar/>
            </div>
            <div class="col col-lg-8 col-md-8 col-sm-12 col-12">
                <div class="graphDiv">
                    <Graph class="chart" v-if="showGraph" @loading="loadingChange"/>
                    <GraphPlaceholder v-if="!showGraph" />
                    <div v-if="loading&&showGraph" id="spinner" class="spinner-border spinner-border-lg"></div>
                </div>
            </div>
            <div class="col col-lg-2 col-md-2 col-sm-12 col-12">
                <RightSidebar />
            </div>
        </div>
    </div>
</template>

<script>
import Graph from "../components/Graph.vue"
import Header from "./Header.vue"
import LeftSidebar from "../components/LeftSidebar.vue"
import RightSidebar from "../components/RightSidebar.vue"
import GraphPlaceholder from "../components/GraphPlaceholder.vue";

export default {  
    name: "Home",
    components: {
        Graph,
        Header,
        LeftSidebar,
        RightSidebar,
        GraphPlaceholder,
    },
    data() {
        return {
            loading: false,
        }
    },
    computed: {
        showGraph: function() {
            return this.$store.getters.showGraph;
        }
    },
    methods: {
        loadingChange: function(loading) {
            this.loading = loading;
        }
    }
};
</script>

<style scoped>
.graphDiv {
    height: 100%;
}

#spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 10;
}
</style>
