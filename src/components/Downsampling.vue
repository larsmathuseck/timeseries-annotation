<template>
    <div class="row">
        <div class="col-auto pe-1">
            <label class="description-text">Downsampling</label>
        </div>
        <div class="col-auto my-auto ps-1">
            <i class="fa-solid fa-chevron-down" :class="{open: !collapsed}" @click="toggleCollapse" />
        </div>
    </div>
    <div class="row" v-if="!collapsed">
        <div class="container-fluid">
            <div class="row">
                <div class="input-group">
                    <select v-model="currentFeature" ref="selectFeature" class="form-select">
                        <option v-for="row in features" :key="row.id" :value="row.id">
                            {{ row.name }}
                        </option>
                    </select>
                    <div class="input-group-apend my-auto">
                        <label class="switch">
                            <input type="checkbox" v-model="showDownsamplingInGraph" @change="toggleShowDownsampling" v-show="false">
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="input-group" id="inputLine">
                    <label for="samplingRateInput" class="col-6 col-form-label my-auto">Sampling Rate</label>
                    <div class="col-2 col-lg-3 my-auto">
                        <input v-model="samplingRate" type="number" class="form-control" id="samplingRateInput" required>
                    </div>
                    <label class="col-4 col-lg-3 col-form-label text-left my-auto">Hertz</label>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import features from "../util/model/ModelFunctions";
import { breakDownToSamplingrate } from "../util/model/ModelInstances";

export default {
    name: "Downsampling",
    data() {
        return {
            collapsed: true,
            features: features,
            currentFeature: 0,
            showDownsamplingInGraph: false,
            samplingRate: 8,
        }
    },
    methods: {
        toggleCollapse: function() {
            this.collapsed = !this.collapsed;
        },  
    },
    computed: {
        dataToWatch: function() {
            return [this.currentFeature, this.showDownsamplingInGraph, this.samplingRate, this.selectedAxes];
        },
        data: function() {
            return this.$store.state.data;
        },
        currentData: function() {
            return this.data?.[this.$store.state.currentSelectedDataIndex];
        },
        // not updating properly
        selectedAxes: function() {
            if (this.currentData) {
                return this.currentData.selectedAxes;
            }
            return [];
        },
        graphData: function() {
            if (!this.showDownsamplingInGraph) {
                return [];
            }
            const downSamplingData = [];
            this.selectedAxes.forEach(axis => {
                const dataPoints = this.currentData.dataPoints[axis-1].dataPoints;
                let featureCalc = breakDownToSamplingrate([dataPoints], this.currentData?.timestamps, this.samplingRate, this.currentFeature);
                featureCalc = featureCalc[1].map((x) => { return [featureCalc[0][featureCalc[1].indexOf(x)], x[0]]; });
                downSamplingData.push({
                    id: this.features[this.currentFeature].id,
                    name: this.features[this.currentFeature].name,
                    dataPoints: featureCalc,
                    color: "blue",
                });
                
            });
            return downSamplingData;
        },
    }, 
    watch: {
        dataToWatch: function() {
            this.$store.commit("setDownsamplingData", this.graphData);
        }   
    }
}
</script>

<style>
.fa-chevron-down {
    transform: rotate(0deg);
    transition: transform 0.25s linear;
}

.fa-chevron-down.open {
    transform: rotate(-180deg);
    transition: transform 0.25s linear;
}

.input-group-apend {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.input-group {
    padding-right: 0;
}

.form-select {
    margin-right: 0.7vw;
}

.switch {
  position: relative;
  display: inline-block;
  width: 3vw;
  height: 1.5vw;
  margin-top: auto;
  margin-bottom: auto;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 1.15vw;
  width: 1.15vw;
  left: 0.25vw;
  bottom: 0.2vw;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(1.25vw);
  -ms-transform: translateX(1.25vw);
  transform: translateX(1.3vw);
}

.slider.round {
  border-radius: 1vw;
}

.slider.round:before {
  border-radius: 50%;
}

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
</style>