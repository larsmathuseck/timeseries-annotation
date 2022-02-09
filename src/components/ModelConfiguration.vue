<template>
    <form id="modelConfigurationSubmit" @submit="onSubmit">
        <div class="container-fluid p-0">
            <div class="row justify-content-center">
                <div class="col-auto">
                    <h5 class="form-label">Import Model from File</h5>
                </div>
            </div>
            <div class="row justify-content-center">
                <div class="col-auto p-0 mx-2">
                    <input id="modelFileInput" type="file" webkitdirectory directory v-on:change="onFileChange" hidden>
                    <button @click="importButtonOnClick" type="button" class="btn btn-light styled-btn">
                        <i class="fa fa-folder"></i>
                        Choose Directory
                    </button>
                </div>
                <div class="col-auto p-0 mx-2" id="importedModelDiv">
                    <p id="importedModelLabel" class="col-form-label m-0 p-0"> {{ modelFileName.length > 0 ? modelFileName : 'No Model selected yet' }}</p>
                </div>
            </div>
            <div class="row-justify-content-center">
                <div class="col-12">
                    <div class="separator"></div>
                </div>
            </div>
            <div class="row">
                <div class="col-12 col-lg-6">
                    <div class="row mb-3 justify-content-center">
                        <label for="slidingWindowInput" class="col-6 col-form-label">Sliding Window</label>
                        <div class="col-2 col-lg-3">
                            <input v-model="slidingWindow" type="number" class="form-control" id="slidingWindowInput" placeholder="4" :disabled="modelFileName.length == 0" required>
                        </div>
                        <label class="col-4 col-lg-3 col-form-label text-left">Seconds</label>
                    </div>
                    <div class="row mb-3 justify-content-center">
                        <label for="samplingRateInput" class="col-6 col-form-label">Sampling Rate</label>
                        <div class="col-2 col-lg-3">
                            <input v-model="samplingRate" type="number" class="form-control" id="samplingRateInput" placeholder="8" :disabled="modelFileName.length == 0" required>
                        </div>
                        <label class="col-4 col-lg-3 col-form-label text-left">Hertz</label>
                    </div>
                    <div class="row mb-3 justify-content-center">
                        <label for="overlapValue" class="col-6 col-form-label">Window Shift</label>
                        <div class="col-2 col-lg-3">
                            <input v-model="windowShift" class="form-control" type="text" id="overlapValue" placeholder="1" :disabled="modelFileName.length == 0" required>
                        </div>
                        <label class="col-4 col-lg-3 col-form-label text-left">Seconds</label>
                    </div>
                    <div class="row mb-3 justify-content-center">
                        <label for="acceptedPercent" class="col-6 col-form-label">Percent Acceptance</label>
                        <div class="col-2 col-lg-3">
                            <input v-model="acceptedPercent" class="form-control" type="text" id="acceptedPercent" placeholder="80" :disabled="modelFileName.length == 0" required>
                        </div>
                        <label class="col-4 col-lg-3 col-form-label text-left">Percent</label>
                    </div>
                    <div class="row mb-3 justify-content-center">
                        <label for="acceptedPercent" class="col-6 col-form-label">Feature to use</label>
                        <div class="col-5 col-lg-6">
                            <select v-model="selectedFeature" ref="select" class="form-select">
                                <option v-for="feature in features" :key="feature.id" v-bind:value="feature" >
                                    {{ feature.name }}
                                </option>
                            </select>
                        </div>
                        <div class="col-1 col-lg-0"></div>
                    </div>
                </div>
                <div class="col-12 col-lg-6">
                    <p>Axis Selection</p>
                    <div class="list-group">
                        <label class="list-group-item" v-for="axis in axes" :key="axis.id">
                            <input class="form-check-input me-1" type="checkbox" v-bind:value="{id: axis.id, name: axis.name}" v-model="selectedAxes" :disabled="modelFileName.length == 0">
                            {{ axis.name }}
                        </label>
                    </div>
                    <div class="col-auto">
                        <label class="pe-2" v-for="axis in selectedAxes" :key="axis.id">
                            {{ (selectedAxes.indexOf(axis) + 1) + ". " + axis.name + ",\t"}}
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <button type="submit" id="submitFormBtn" hidden></button>
        <div class="row justify-content-center">
            <div class="col-auto">
                <button type="button" class="btn btn-primary" @click="loadDataIntoModel">Load Data in Model</button>
            </div>
        </div>
    </form>
</template>

<script>
import * as tf from '@tensorflow/tfjs';
import features from "../model/ModelFunctions";

export default {
    name: "ModelConfiguration",
    data() {
        this.model = null;
        return {
            modelFileName: "",
            slidingWindow: null,
            samplingRate: null,
            windowShift: null,
            acceptedPercent: null,
            inputsFilledOut: false,
            selectedAxes: [],
            features: features,
            selectedFeature: features[0],
        }
    },
    methods: {
        importButtonOnClick: function() {
            document.getElementById("modelFileInput").click()
        },
        onFileChange: function(e) {
            const fileList = e.target.files;
            let model;
            const weights = [];
            for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
                const file = fileList[i];
                if(file.name[0] != '.' && (file.type.includes("json") && file.name.includes("model"))) {
                    model = file;
                }
                else if(file.name[0] != '.') {
                    weights.push(file);
                }
            }
            this.importModel(model, weights);
        },
        importModel: async function(modelFile, weights) {
            tf.serialization.registerClass(L2);
            const reader = new FileReader();
            reader.readAsText(modelFile);
            reader.onload = async () => {
                const model = JSON.parse(reader.result);
                const layers = model?.modelTopology?.model_config?.config.layers;
                if(layers != null){
                    layers.forEach(layer => {
                        let config = layer.config;
                        delete config.activity_regularizer;
                    })
                }
                let modelArray = [new File([JSON.stringify(model)], "model.json")];
                weights.forEach(weight => {
                    modelArray.push(weight);
                });
                await tf.loadLayersModel(tf.io.browserFiles(modelArray)).then((model) => this.modelLoaded(model, modelFile.name));
            }
        },
        modelLoaded: async function(model, modelFileName) {
            this.modelFileName = modelFileName;
            this.model = model;
        },
        submitForm: function() {
            document.getElementById("submitFormBtn").click();
        },
        onSubmit: function(e) {
            e.preventDefault();
            this.inputsFilledOut = true;
        },
        loadDataIntoModel: function() {
            this.submitForm();
            if (!this.inputsFilledOut) {
                return;
            }
            if (!this.validateInputs()) {
                return;
            }
            const modelConfiguration = {
                    model: this.model,
                    slidingWindow: this.slidingWindow,
                    samplingRate: this.samplingRate,
                    windowShift: this.windowShift,
                    selectedAxes: this.selectedAxes,
                    feature: this.selectedFeature,
            };
            this.$emit("loadDataIntoModel", modelConfiguration)
        },
        validateInputs: function() {
            let invalidFeedback = "";
            const data = this.$store.state.data;
            if (this.model == null) {
                invalidFeedback = "No Model imported yet!";
            }
            else if (isNaN(this.windowShift)) {
                invalidFeedback ="Window Shift must be a number!";
            }
            else if (this.windowShift >= this.slidingWindow) {
                invalidFeedback = "Window Shift must be less than Sliding Window!";
            }
            else if (this.windowShift < 0) {
                invalidFeedback = "Window Shift can not be a negative Number!";
            }
            else if (this.windowShift != 0 && this.isMultiple(this.slidingWindow, this.windowShift) != 0) {
                invalidFeedback = "Sliding Window must be a multiple from Window Shift!";
            }
            else if (isNaN(this.acceptedPercent)) {
                invalidFeedback = "Accepted Percent must be a number!";
            }
            else if (this.acceptedPercent < 0) {
                invalidFeedback = "Accepted Percent must be greater than 0%!";
            }
            else if (this.acceptedPercent > 100) {
                invalidFeedback = "Accepted Percent must be less than 101%!"
            }
            else if (data.length == 0) {
                invalidFeedback = "Please upload data first!"
            }
            else if (this.selectedAxes.length == 0) {
                invalidFeedback = "At least one Axis has to be chosen!";
            }
            if (invalidFeedback.length == 0) {
                return true;
            } else {
                this.$emit("setInvalidFeedback", invalidFeedback)
                return false;
            }
        },
        isMultiple: function(a, b) {
            // this function is needed, since the normal Javascript modulo seem to not work like expected. With this we only check if the result of division is an float by searching for a comma.
            const temp = (a/b).toString();
            const commaIndex = temp.indexOf(".");
            return commaIndex == -1 ? 0 : commaIndex;
        }
    },
    computed: {
        axes: function() {
            return this.$store.getters.getAxes;
        },
    },
}

class L2 {
    static className = 'L2';

    constructor(config) {
        return tf.regularizers.l1l2(config)
    }
}
</script>

<style scoped>
p {
    margin-bottom: 0.5rem;
}

.styled-btn {
    background-color: #e1e1e5;
    font-size: 0.9rem;
}

#importedModelDiv {
    padding: 0;
    margin: auto;
}

#importedModelLabel {
    font-size: 1rem;
}

.text-left {
    text-align: left;
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

.styled-btn {
    background-color: #e1e1e5;
    font-size: 0.9rem;
}

#importedModelDiv {
    padding: 0;
    margin: auto;
}

#importedModelLabel {
    font-size: 1rem;
}

.separator {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 10px 0 10px 0;    
}

.separator::before,
.separator::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid grey;
}
</style>