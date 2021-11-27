<template>
    <div class="container-fluid">
        <Header title="TF Annotator" />
        <div class="row">
            <div class="col col-2">
                <LeftSightbar
                :axes="axes"
                :annotationFiles="annotationFiles"
                />
            </div>
            <div class="col col-8">
                <graph v-if="showGraph" class="chart" />
            </div>
            <div class="col col-2">
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
    data() {
        return {
            showGraph: true,
            axes: [],
            annotationFiles: [],
            labels: [],
            activeLabel: Object,
        }
    },
    created() {
        this.axes = [
            { 
                name: "ACC-X",
            },
            { 
                name: "ACC-Y",
            },
            { 
                name: "ACC-Z",
            }
        ];
        this.annotationFiles = [
            {
                id: 1,
                name: "annoFile1"
            },
            {
                id: 2,
                name: "testFile"
            },
            {
                id: 3,
                name: "bliblu"
            },
        ];
        this.labels = [
            {
                id: 1,
                name: "openOrClosed",
                color: "red",
            },
            {
                id: 2,
                name: "tilted_opening",
                color: "orange",
            },
            {
                id: 3,
                name: "tilted",
                color: "yellow",
            },
            {
                id: 4,
                name: "tilted_closing",
                color: "teal",
            },
            {
                id: 5,
                name: "end",
                color: "green",
            },
        ];
        this.activeLabel = this.labels[0];
    },
    methods: {
        
    },
};
</script>

<style scoped>

</style>
