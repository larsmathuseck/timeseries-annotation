<template>
    <div class="container-fluid pt-0 px-0">
        <form @submit="onSubmit">
            <div class="row mb-3 justify-content-center">
                <div class="col-2"></div>
                <label for="selectedAxis" class="col-4 col-form-label">Axis</label>
                <div class="col-4 col-lg-5">
                    <select v-model="selectedAxis" id="selectedAxis" ref="select" class="form-select" required>
                        <option v-for="axis in axes" :key="axis.id" v-bind:value="{name: axis.name, id: axis.id}" >
                            {{ axis.name }}
                        </option>
                    </select>
                </div>
                <div class="col-2 col-lg-1"></div>
            </div>
            <div class="row mb-3 justify-content-center">
                <div class="col-2"></div>
                <label for="selectedFeature" class="col-4 col-form-label">Feature</label>
                <div class="col-4 col-lg-5">
                    <select v-model="selectedFeature" id="selectedFeature" ref="select" class="form-select" required>
                        <option v-for="feature in features" :key="feature.id" v-bind:value="feature" >
                            {{ feature.name }}
                        </option>
                    </select>
                </div>
                <div class="col-2 col-lg-1"></div>
            </div>
            <div class="row mb-3 justify-content-center">
                <div class="col-2"></div>
                <label for="dataPointsPerInstanceInput" class="col-4 col-form-label">Datapoints</label>
                <div class="col-2">
                    <input v-model="dataPointsPerInstance" type="text" class="form-control" id="dataPointsPerInstanceInput" placeholder="4" required>
                </div>
                <label class="col-2 col-lg-3 col-form-label text-start"></label>
                <div class="col-2 col-lg-1"></div>
            </div>
            <div class="row mb-3 justify-content-center">
                <div class="col-auto">
                    <button type="submit" class="btn btn-primary">Add <i class="fa fa-plus"></i></button>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
import features from "../model/ModelFunctions"
export default {
    name: "AddFeature",
    data() {
        return {
            counter: 0,
            features: features,
            selectedFeature: features[0],
            dataPointsPerInstance: null,
            selectedAxis: null,
        }
    },
    methods: {
        onSubmit: function(e) {
            e.preventDefault();
            if (!this.validateInputs()) {
                return;
            }
            const feature = {
                func: this.selectedFeature.func,
                id: this.selectedFeature.id,
                name: this.selectedFeature.name,
            }
            const featureConfiguration = {
                id: this.counter,
                feature: feature,
                dataPointsPerInstance: this.dataPointsPerInstance,
                axis: this.selectedAxis,
            }
            this.counter++;
            this.$emit("addFeature", featureConfiguration);
        },
        validateInputs: function() {
            let invalidFeedback = "";
            if (isNaN(this.dataPointsPerInstance)) {
                invalidFeedback ="Data Points must be a number!";
            }
            else if (this.dataPointsPerInstance < 0) {
                invalidFeedback = "Data Points can not be a negative Number!";
            }
            if (invalidFeedback.length == 0) {
                return true;
            } else {
                this.$emit("setInvalidFeedback", invalidFeedback)
                return false;
            }
        }
    },
    computed: {
        axes: function() {
            return this.$store.getters.getAxes;
        },
    },
    watch: {
        axes: function() {
            console.log(this.axes);
            if (this.axes != undefined && this.axes.length != 0) {
                const temp = {
                    name: this.axes[0].name, 
                    id: this.axes[0].id
                }
                this.selectedAxis = temp;
            }
        }
    }
}
</script>

<style scoped>
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
</style>