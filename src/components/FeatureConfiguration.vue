<template>
    <div class="container-fluid p-0">
        <div class="row justify-content-center">
            <div class="col-auto">
                <h5 class="form-label">Import Model from File</h5>
            </div>
        </div>
        <form @submit="onSubmit">
            <div class="row justify-content-center">
                <div class="col-auto">
                    <input id="featureModelFileInput" type="file" webkitdirectory directory v-on:change="onFileChange" hidden>
                    <button @click="importButtonOnClick" type="button" class="btn btn-light styled-btn">
                        <i class="fa fa-folder"></i>
                        Choose Directory
                    </button>
                </div>
                <div class="col-auto my-auto">
                    <p class="m-0"> {{ featureModelFileName.length > 0 ? featureModelFileName : 'No Model selected yet' }}</p>
                </div>
            </div>
            <div class="row-justify-content-center">
                <div class="col-12">
                    <div class="separator"></div>
                </div>
            </div>
            <div class="row">
                <div class="col-12 col-lg-6">
                    <AddFeature @addFeature="addFeature" @setInvalidFeedback="setInvalidFeedback"/>
                    <div class="row mb-3 justify-content-center">
                        <div class="col-2"></div>
                        <label for="slidingWindowInput" class="col-4 col-form-label">Sliding Window</label>
                        <div class="col-2">
                            <input v-model="slidingWindow" type="number" class="form-control" id="slidingWindowInput" placeholder="4" :disabled="featureModelFileName.length == 0" required>
                        </div>
                        <label class="col-2 col-lg-3 col-form-label text-start">Seconds</label>
                        <div class="col-2 col-lg-1"></div>
                    </div>
                    <div class="row mb-3 justify-content-center">
                        <div class="col-2"></div>
                        <label for="samplingRateInput" class="col-4 col-form-label">Sampling Rate</label>
                        <div class="col-2">
                            <input v-model="samplingrate" type="number" class="form-control" id="samplingRateInput" placeholder="8" :disabled="featureModelFileName.length == 0" required>
                        </div>
                        <label class="col-2 col-lg-3 col-form-label text-start">Hertz</label>
                        <div class="col-2 col-lg-1"></div>
                    </div>
                </div>
                <div class="col-12 col-lg-6">
                    <div class="row mb-3 justify-content-center">
                        <p>Feature Order</p>
                    </div>
                    <div class="row mb-3 justify-content-center">
                        <draggable :disbaled="false " :list="features" item-key="id" class="list-group" ghost-class="ghost" >
                            <template #item="{ element  }">
                                <div class="list-group-item"> 
                                    {{ element.axis.name + "-" + element.feature.name + "-" + element.dataPointsPerInstance}}
                                    <button type="button" class="btn btn-default btn-circle trash-btn me-1" @click="deleteFeature(element)">
                                        <i class="fa fa-trash"></i>
                                    </button>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>
            </div> 
            <div class="row justify-content-center">
                <div class="col-auto">
                    <button type="submit" class="btn btn-primary" >Load Data in Model</button>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
import * as tf from '@tensorflow/tfjs';
import draggable from "vuedraggable";
import AddFeature from "./AddFeature.vue";

export default {
    name: "FeatureConfiguration",
    components: {
        draggable,
        AddFeature,
    },
    data() {
        this.model = null;
        return {
            featureModelFileName: "",
            addFeatureVisible: false,
            samplingrate: null,
            slidingWindow: null,
            features: [],
        }
    },
    methods: {
        importButtonOnClick: function() {
            document.getElementById("featureModelFileInput").click()
        },
        onFileChange: async function(e) {
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
            this.featureModelFileName = modelFileName;
            this.model = model;
            console.log(this.featureModelFileName);
        },
        addFeature: function(featureData) {
            this.features.push(featureData);
        },
        setInvalidFeedback: function(invalidFeedback) {
            this.$emit('setInvalidFeedback', invalidFeedback)
        },
        onSubmit: function(e) {
            e.preventDefault();
            if (!this.validateInputs()) {
                return;
            }
            // TODO load data into model via this.$emit in ImportModelModal
            console.log(this.features);
        },
        validateInputs: function() {
            let invalidFeedback = "";
            if (this.model == null) {
                invalidFeedback = "No Model imported yet!";
            }
            else if (isNaN(this.slidingWindow)) {
                invalidFeedback = "Sliding Window must be a number!";
            }
            else if (this.slidingWindow < 0) {
                invalidFeedback = "Sliding Window can not be a negative Number!";
            }
            else if (this.samplingrate < 0) {
                invalidFeedback = "Sampling Rate can not be a negative Number!";
            }
            else if (this.features.length == 0) {
                invalidFeedback = "At least one Feature has to be added!"
            }
            if (invalidFeedback.length == 0) {
                return true;
            } else {
                this.$emit("setInvalidFeedback", invalidFeedback)
                return false;
            }
        },
        deleteFeature: function(feature) {
            console.log(feature);
            console.log(this.features);
            const index = this.features.indexOf(feature);
            console.log(index);
            this.features.splice(index, 1);
            console.log(this.features);
        }
    }
}
class L2 {
    static className = 'L2';

    constructor(config) {
        return tf.regularizers.l1l2(config)
    }
}
</script>

<style scoped>
.styled-btn {
    background-color: #e1e1e5;
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

.list-group-item {
    cursor: move;
    cursor: grab;
    cursor: -moz-grab;
    cursor: -webkit-grab;
}

.list-group-item:active {
    cursor: grabbing;
    cursor: -moz-grabbing;
    cursor: -webkit-grabbing;
}

.btn-circle {
    height: 1.5rem;
    width: 1.5rem;
    border-radius: 50%;
    text-align: center;
    background-color: #bbb;
    opacity: 0.7;
    margin-top: auto;
    margin-bottom: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0px;
}

.btn-circle:hover { 
    opacity: 1;
}
</style>