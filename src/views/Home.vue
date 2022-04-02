<template>
    <div class="container-fluid d-flex h-100 flex-column">
        <Header title="TF Annotator" />
        <div class="row h-100 mt-2">
            <div class="col col-lg-2 col-md-2 col-sm-12 col-12">
                <LeftSidebar v-if="showSidebars"/>
            </div>
            <div class="col col-lg-8 col-md-8 col-sm-12 col-12">
                <div class="graphDiv">
                    <Graph class="chart" v-if="showGraph" @loading="loadingChange"/>
                    <GraphPlaceholder v-if="!showGraph" />
                    <div v-if="loading&&showGraph" id="spinner" class="spinner-border spinner-border-lg"></div>
                </div>
            </div>
            <div class="col col-lg-2 col-md-2 col-sm-12 col-12">
                <RightSidebar v-if="showSidebars"/>
            </div>
        </div>
    </div>
</template>

<script>
import Graph from "../components/graph/Graph.vue"
import Header from "./Header.vue"
import LeftSidebar from "./LeftSidebar.vue"
import RightSidebar from "./RightSidebar.vue"
import GraphPlaceholder from "../components/graph/GraphPlaceholder.vue";
import { liveQuery } from "dexie";
import { db } from "/db";
import { useObservable } from "@vueuse/rxjs";

export default {  
    name: "Home",
    components: {
        Graph,
        Header,
        LeftSidebar,
        RightSidebar,
        GraphPlaceholder,
    },
    setup() {
        const annotationFiles = useObservable(liveQuery(() => db.annotations.toArray()));
        return { annotationFiles }
    },
    data() {
        return {
            loading: false,
            showSidebars: false,
        }
    },
    computed: {
        showGraph: function() {
            return this.$store.getters.showGraph;
        },
        data: function() {
            return this.$store.state.data;
        }
    },
    methods: {
        loadingChange(loading) {
            this.loading = loading;
        },
        updateShowSidebars() {
            if(Object.keys(this.data)?.length > 0 || this.annotationFiles?.length > 0){
                this.showSidebars = true;
            }
            else {
                this.showSidebars = false;
            }
        }
    },
    watch: {
        data: {
            handler() {
                this.updateShowSidebars();
            },
            deep: true,
        },
        annotationFiles: function() {
            this.updateShowSidebars();
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
