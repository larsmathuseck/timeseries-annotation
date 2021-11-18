<template>
  <graph v-if="showGraph" class="chart" :option="option" />
</template>

<script>
import graph from "./Graph.vue"

export default {  
  name: "Home",
  components: {
      graph,
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
