<template>
    <div class="container-fluid">
        <Header title="TF Annotator" />
        <div class="row">
            <div class="col col-2">
                <LeftSightbar
                :annotationFiles="annotationFiles" />
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
            annotationFiles: [],
        }
    },
    created() {
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
    },
};
</script>

<style scoped>

</style>
