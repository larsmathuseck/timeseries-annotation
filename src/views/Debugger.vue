<template>
    <div class="container-fluid d-flex h-100 flex-column">
        <Header title="TF Annotator Debugger" :debug="true"/>
        <div class="row h-100" id="main-row">
            <div class="col col-lg-2 col-md-2 col-sm-12 col-12">
                <div class="row">
                    <label class="description-text" >Data Files</label>
                    <div class="input-group">
                        <FileSelect type="data" :data="data" :selected="lastSelectedData" />
                    </div>
                </div>
                <div class="row">
                    <label class="description-text" >Axis</label>
                    <div class="input-group">
                        <select v-model="currentSelectedAxis" ref="selectAxis" class="form-select">
                            <option v-for="row in axes" :key="row.id" v-bind:value="row.id">
                                {{ row.name }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <label class="description-text" >Feature</label>
                    <div class="input-group">
                        <select v-model="currentFeature" ref="selectFeature" class="form-select">
                            <option v-for="row in axes" :key="row.id" v-bind:value="row.id">
                                {{ row.name }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="input-group" id="inputLine">
                        <label for="slidingWindowInput" class="col-6 col-form-label">Sliding Window</label>
                        <div class="col-2 col-lg-3">
                            <input v-model="slidingWindow" type="number" class="form-control" id="slidingWindowInput" placeholder="4" required>
                        </div>
                        <label class="col-4 col-lg-3 col-form-label text-left">Seconds</label>
                    </div>
                </div>
                <div class="row">
                    <div class="input-group" id="inputLine">
                        <label for="samplingRateInput" class="col-6 col-form-label">Sampling Rate</label>
                        <div class="col-2 col-lg-3">
                            <input v-model="samplingRate" type="number" class="form-control" id="samplingRateInput" placeholder="8" required>
                        </div>
                        <label class="col-4 col-lg-3 col-form-label text-left">Hertz</label>
                    </div>
                </div>
                <div class="row">
                    <div class="input-group" id="inputLine">
                        <label for="overlapValue" class="col-6 col-form-label">Window Shift</label>
                        <div class="col-2 col-lg-3">
                            <input v-model="windowShift" class="form-control" type="text" id="overlapValue" placeholder="1" required>
                        </div>
                        <label class="col-4 col-lg-3 col-form-label text-left">Seconds</label>
                    </div>
                </div>
                
            </div>
            <div class="col col-lg-8 col-md-8 col-sm-12 col-12">
                <div class="graphDiv">
                    <graph ref="graphRef" v-if="showGraph" class="chart"  :data="dataPoints"/>
                </div>
            </div>
            <div class="col col-lg-2 col-md-2 col-sm-12 col-12">
                
            </div>
        </div>
    </div>
</template>

<script>
import graph from "../components/DebugGraph.vue"
import Header from "./Header.vue"
import FileSelect from "../components/FileSelect.vue"

export default {  
    name: "Debugger",
    components: {
        graph,
        Header,
        FileSelect,
    },
    data() {
        return {
            lastSelectedData: this.$store.state.currentSelectedData,
            currentSelectedAxis: 1,
            currentFeature: 1,
            slidingWindow: null,
            samplingRate: null,
            windowShift: null,
        }
    },
    computed: {
        showGraph: function(){
            return this.$store.getters.showGraph;
        },
        data: function() {
            return this.$store.state.data;
        },
        axes: function() {
            return this.$store.getters.getAxes;
        },
        dataPoints: function() {
            const currentData = this.data?.[this.$store.state.currentSelectedData];
            return [currentData?.dataPoints[this.currentSelectedAxis-1]];
        },
    },
    watch: {
        
    }
};
</script>

<style scoped>
.graphDiv {
    height: 100%;
}

#main-row {
    padding-top: 20px;
}

#inputLine {
    padding-top: 20px;
}

/**needed to hide arrows in number field */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}

input { 
    text-align: center; 
}

.list-group {
  display: grid !important;
  grid-template-columns: repeat(3, 1fr);
  border-radius: 0;
}

.list-group-item {
    border: 1px solid rgba(0,0,0,.125) !important;
    border-radius: 0rem;
}

p {
    margin-bottom: 0.5rem;
}
</style>
