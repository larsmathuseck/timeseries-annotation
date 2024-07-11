<template>
    <div class="container-fluid d-flex h-100 flex-column">
        <TfaHeader title="TF Annotator" />
        <div class="row h-100 mt-2">
            <div class="col col-lg-2 col-md-2 col-sm-12 col-12">
                <TfaLeftSidebar v-if="showSidebars" @reloadGraph="reloadGraph"/>
            </div>
            <div class="col col-lg-8 col-md-8 col-sm-12 col-12">
                <div class="graphDiv">
                    <TfaGraph class="chart" ref="graph" v-if="showGraph" @loading="loadingChange"/>
                    <TfaGraphPlaceholder v-if="!showGraph" />
                    <div v-if="loading&&showGraph" id="spinner" class="spinner-border spinner-border-lg"></div>
                </div>
            </div>
            <div class="col col-lg-2 col-md-2 col-sm-12 col-12">
                <TfaRightSidebar v-if="showSidebars"/>
            </div>
        </div>
    </div>
</template>

<script>
import TfaGraph from "../components/tfa/graph/TfaGraph.vue"
import TfaHeader from "./TfaHeader.vue"
import TfaLeftSidebar from "./TfaLeftSidebar.vue"
import TfaRightSidebar from "./TfaRightSidebar.vue"
import TfaGraphPlaceholder from "../components/tfa/graph/TfaGraphPlaceholder.vue";
import { liveQuery } from "dexie";
import { db } from "/db";
import { useObservable } from "@vueuse/rxjs";

export default {
    name: "TfaHome",
    components: {
        TfaGraph,
        TfaHeader,
        TfaLeftSidebar,
        TfaRightSidebar,
        TfaGraphPlaceholder,
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
            return this.$store.getters.getData;
        }
    },
    methods: {
        loadingChange(loading) {
            this.loading = loading;
        },
        updateShowSidebars() {
            if(Object.keys(this.data)?.length > 0 || this.annotationFiles?.length > 0) {
                this.showSidebars = true;
            }
            else {
                this.showSidebars = false;
            }
        },
        reloadGraph(){
            this.$refs.graph.updateGraph();
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
