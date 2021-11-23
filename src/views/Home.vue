<template>
    <div class="container-fluid">
        <Header title="TF Annotator" />
        <div class="row">
            <div class="col col-2">
                <LeftSightbar 
                @add-selected-axis="addSelectedAxis"
                @delete-selected-axis="deleteSelectedAxis"
                :axes="axes" 
                :annotationFiles="annotationFiles" 
                :selectedAxes="selectedAxes"
                :colors="colors" />
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
            colors: [],
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
        this.colors = ["red", "orange", "yellow", "olive", "green", "teal", "blue", "violet", "purple", "pink", "brown", "grey"];
    },
    methods: {
        addSelectedAxis(lastSelectedAxis) {
            const newSelectedAxisName = lastSelectedAxis.name;
            const iterator = this.selectedAxes.values();

            for (const axis of iterator) { // needed if only color change of existing axis
                if (axis.name === newSelectedAxisName) {
                    const index = this.selectedAxes.indexOf(axis)
                    if (index > -1) {
                        this.selectedAxes.splice(index, 1);
                    }
                }
            }
            this.selectedAxes.push(lastSelectedAxis);
        },
        deleteSelectedAxis(axis) {
            console.log("delete: ", axis)
            if (this.selectedAxes.length <= 1) {
                alert("At least 1 axis must be selected!")
                return;
            }
            const index = this.selectedAxes.indexOf(axis)
            if (index > -1) {
                this.selectedAxes.splice(index, 1)
            }
        },
    },
};
</script>

<style scoped>

</style>
