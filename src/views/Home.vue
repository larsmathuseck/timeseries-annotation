<template>
    <div class="container-fluid">
        <Header title="TF Annotator" />
        <div class="row">
            <div class="col col-2">
                <LeftSightbar :axes="axes" />
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
        }
    },
    created() {
        this.axes = [
            { 
                id: 1,
                name: "ACC-X"
            },
            { 
                id: 2,
                name: "ACC-Y"
            },
            { 
                id: 3,
                name: "ACC-Z"
            }
        ]
    },
    methods: {
        
    },
};
</script>

<style scoped>

</style>
