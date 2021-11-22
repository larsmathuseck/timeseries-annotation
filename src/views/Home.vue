<template>
    <div class="container-fluid">
        <Header title="TF Annotator" />
        <div class="row">
            <div class="col col-2">
                <LeftSightbar 
                @add-selected-axis="addSelectedAxis"
                :axes="axes" 
                :annotationFiles="annotationFiles" 
                :selectedAxes="selectedAxes" />
            </div>
            <div class="col col-8">
                <graph v-if="showGraph" class="chart" :option="option" />
            </div>
            <div class="col col-2">
                right
            </div>
        </div>
    </div>
</template>

<script>
import graph from "./Graph.vue"
import Header from "./Header.vue"
import LeftSightbar from "./LeftSightbar.vue"

export default {  
    name: "Home",
    components: {
        graph,
        Header,
        LeftSightbar,
    },
    data() {
        return {
            showGraph: true,
            axes: [],
            annotationFiles: [],
            selectedAxes: [],
        }
    },
    created() {
        this.axes = [
            { 
                name: "ACC-X"
            },
            { 
                name: "ACC-Y"
            },
            { 
                name: "ACC-Z"
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
        ]
    },
    methods: {
        addSelectedAxis(event) {
            const newSelectedAxisName = event.target.value;
            const newSelectedAxis = {
                id: this.selectedAxes.length + 1,
                name: newSelectedAxisName,
            }
            const iterator = this.selectedAxes.values();

            for (const axis of iterator) {
                if (axis.name === newSelectedAxisName) {
                    return;
                }
            }
            this.selectedAxes.push(newSelectedAxis)
        },
    },
};
</script>

<style scoped>

</style>
