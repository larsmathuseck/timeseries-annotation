<template>
    <div class="container-fluid">
        <Header title="TF Annotator" />
        <graph v-if="showGraph" class="chart" :option="option" />
    </div>
</template>

<script>
import graph from "./Graph.vue"
import Header from "./Header.vue"

export default {  
    name: "Home",
    components: {
        graph,
        Header,
    },
    data: () => {
        return {
        showGraph: true,
        }
    },
    methods: {
        
    },
};
</script>

<style scoped>

</style>
