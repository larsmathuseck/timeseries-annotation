<template>
    <div class="container-fluid p-0">
        <div class="row justify-content-center">
            <div class="col-auto">
                <h5 class="form-label">Import Model from File</h5>
            </div>
        </div>
        <form @submit="onSubmit">
            <div class="row">
                <div class="col-6">
                    <div class="row justify-content-end">
                        <div class="col-auto">
                            <input id="featureModelFileInput" type="file" webkitdirectory directory v-on:change="onFeatureModelFileChange" hidden>
                            <button @click="modelImportButtonOnClick" type="button" class="btn btn-light styled-btn">
                                <i class="fa fa-folder"></i>
                                Choose Directory
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-6 my-auto">
                    <div class="row justify-content-start">
                        <div class="col-auto my-auto">
                            <p class="m-0"> {{ featureModelFileName.length > 0 ? featureModelFileName : 'No Model imported' }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-6">
                    <div class="row justify-content-end">
                        <div class="col-auto">
                            <input id="featureConfigFileInput" type="file" v-on:change="onFeatureConfigFileChange" hidden>
                            <button @click="configImportButtonOnClick" type="button" class="btn btn-light styled-btn" :class="{disabled: featureModelFileName.length == 0}">
                                <i class="fa fa-folder"></i>
                                Import Config File
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-6 my-auto">
                    <div class="row justify-content-start">
                        <div class="col-auto my-auto">
                            <p class="m-0"> {{ featureConfigName.length > 0 ? featureConfigName : 'No Config imported' }}</p>
                        </div>
                    </div>
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
                        <label for="samplingRateInput" class="col-4 col-form-label">Sampling Rate</label>
                        <div class="col-2">
                            <input v-model="samplingRate" type="number" class="form-control" id="samplingRateInput" placeholder="8" :disabled="featureModelFileName.length == 0" required>
                        </div>
                        <label class="col-2 col-lg-3 col-form-label text-start">Hertz</label>
                        <div class="col-2 col-lg-1"></div>
                    </div>
                    <div class="row mb-3 justify-content-center">
                        <div class="col-2"></div>
                        <label for="selectedDownsamplingMethod" class="col-4 col-form-label">Downsampling Method</label>
                        <div class="col-4 col-lg-5">
                            <select v-model="selectedDownsamplingMethod" id="selectedDownsamplingMethod" ref="select" class="form-select" :disabled="featureModelFileName.length == 0">
                                <option v-for="method in downsamplingMethods" :key="method" v-bind:value="method" >
                                    {{ method }}
                                </option>
                            </select>
                        </div>
                        <div class="col-2 col-lg-1"></div>
                    </div>
                </div>
                <div class="col-12 col-lg-6">
                    <div class="row justify-content-center">
                        <p>Feature Order</p>
                    </div>
                    <div class="row mb-3 justify-content-center">
                        <draggable :disbaled="false " :list="features" item-key="id" class="list-group" ghost-class="ghost" >
                            <template #item="{ element  }">
                                <div class="list-group-item"> 
                                    {{ element.axis.name + "-" + element.feature.name + "-" + (element.slidingWindow*this.samplingRate)}}
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
                    <button type="submit" class="btn btn-primary" >
                        <div v-if="loading" class="spinner-border spinner-border-sm"></div>
                        Load Data in Model
                    </button>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
import features from "../model/ModelFunctions";
import * as tf from '@tensorflow/tfjs';
import draggable from "vuedraggable";
import AddFeature from "./AddFeature.vue";
import { createFeatureInstances } from "../model/ModelInstances";
import { db } from "/db";

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
            featureConfigName: "",
            addFeatureVisible: false,
            samplingRate: null,
            features: [],
            loading: false,
            downsamplingMethods: ["First", "Last", "Median"],
            selectedDownsamplingMethod: "First",
        }
    },
    props: {
        toggleConfigDownload: Boolean,
    },
    methods: {
        modelImportButtonOnClick: function() {
            document.getElementById("featureModelFileInput").click()
        },
        configImportButtonOnClick: function() {
            document.getElementById("featureConfigFileInput").click()
        },
        onFeatureModelFileChange: async function(e) {
            const fileList = e.target.files;
            let model;
            let config = null;
            const weights = [];
            for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
                const file = fileList[i];
                if(file.name[0] != '.' && (file.type.includes("json") && file.name.includes("model"))) {
                    model = file;
                }
                else if ((file.name.includes("configuration") || file.name.includes("config")) && file.type.includes("json")) {
                    config = file;
                }
                else if(file.name[0] != '.') {
                    weights.push(file);
                }
            }
            this.importModel(model, weights, config);
        },
        onFeatureConfigFileChange: function(e) {
            this.clearModelConfiguration();
            this.setModelConfiguration(e.target.files[0]);
        },
        importModel: async function(modelFile, weights, config) {
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
                await tf.loadLayersModel(tf.io.browserFiles(modelArray)).then((model) => this.modelLoaded(model, modelFile.name, config));
            }
        },
        modelLoaded: async function(model, modelFileName, config) {
            this.featureModelFileName = modelFileName;
            this.model = model;
            this.features = [];
            if (config) {
                this.setModelConfiguration(config);
            }
        },
        setModelConfiguration: function(config) {
            this.featureConfigName = config.name;
            const reader = new FileReader();
            reader.readAsText(config);
            reader.onload = async () => { 
                const json = JSON.parse(reader.result);
                this.samplingRate = json.samplingRate;
                const features = json.features;
                this.selectedDownsamplingMethod = json.downsamplingMethod || this.selectedDownsamplingMethod;
                if (features) {
                    features.forEach(feature => {
                        const func = this.featureExists(feature);
                        if (func != null) {
                            let featureToAdd = feature;
                            featureToAdd.feature.func = func;
                            this.features.push(featureToAdd);
                        }
                    });
                }
            }
        },
        clearModelConfiguration: function() {
            this.samplingRate = null;
            this.features = [];
            this.selectedDownsamplingMethod = "First";
        },
        featureExists: function(feature) {
            for (let i = 0; i < features.length; i++) {
                if (features[i].name == feature.feature.name && features[i].id == feature.feature.id) {
                    if(this.axisExists(feature.axis)) {
                        return features[i].func;
                    } else {
                        return null;
                    }
                }
            }
        },
        axisExists: function(axis) {
            const axes = this.$store.state.data[this.$store.state.currentSelectedData].dataPoints;
            for (let i = 0; i < axes.length; i++) {
                if (axes[i].name == axis.name && axes[i].id == axis.id) {
                    return true;
                }
            }
            return false;
        },
        addFeature: function(featureData) {
            this.features.push(featureData);
        },
        setInvalidFeedback: function(invalidFeedback) {
            this.$emit('setInvalidFeedback', invalidFeedback)
        },
        onSubmit: async function(e) {
            this.loading = true;
            e.preventDefault();
            if (!this.validateInputs()) {
                this.loading = false;
                return;
            }
            // TODO load data into model via this.$emit in ImportModelModal
            const result = createFeatureInstances(this.$store.state.data[this.$store.state.currentSelectedData], this.features, this.samplingRate, this.selectedDownsamplingMethod);
            const instances = result[0];
            const offsetInSeconds = result[1];
            const smallestFeatureWindow = result[2];
            let predictedValues = [];
            try {
                const tensor = tf.tensor(instances);
                const a = this.model.predict(tensor);
                predictedValues.push({data: a.arraySync()});               
            } catch (error) {
                this.loading = false;
                this.$emit("setInvalidFeedback", error.messageback);
                return;
            }
             // create annotation file
            const annotationId = await this.createNewAnnotationFile();
            // create as many labels as needed
            const labelAmount = predictedValues[0].data[0].length;
            await this.createLabelsForAnnotation(annotationId, labelAmount);
            // create all the areas
            const allLabels = await db.labels.where("annoId").equals(annotationId).toArray();
            let timestamp = this.$store.state.data[this.$store.state.currentSelectedData].timestamps[0] + 1000*offsetInSeconds;
            let nextTimestamp;
            predictedValues[0].data.forEach(prediction => {
                nextTimestamp = timestamp + 1000*smallestFeatureWindow;
                let max = Math.max(...prediction);
                if(max){
                    let index = prediction.indexOf(max);
                    const label = allLabels[index];
                    db.areas.add({
                        annoId: annotationId,
                        labelId: label.id,
                        firstTimestamp: timestamp,
                        secondTimestamp: nextTimestamp,
                    });
                }
                timestamp = nextTimestamp;
            });
            db.lastSelected.update(1, {annoId: parseInt(annotationId)});
            if (!this.$store.state.areasVisible) {
                this.$store.commit("toggleAreasVisibility");
            }
            this.loading = false;
            this.$emit("closeModal");
        },
        createNewAnnotationFile: async function() {
            return await db.annotations.add({
                name: "AnnotationCreatedByModel",
                lastAdded: {},
            });
        },
        createLabelsForAnnotation: async function(annotationId, amountOfLabels) {
            for (let i = 0; i < amountOfLabels; i++) {
                await db.labels.add({
                    name: "label_" + i,
                    color: this.$store.state.colors[i % this.$store.state.colors.length],
                    annoId: annotationId,
                });
            }
        },
        validateInputs: function() {
            let invalidFeedback = "";
            if (this.model == null) {
                invalidFeedback = "No Model imported yet!";
            }
            else if (this.samplingRate < 0) {
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
            const index = this.features.indexOf(feature);
            this.features.splice(index, 1);
        },
        prepareConfigDownload: function() {
            const config = {
                samplingRate: this.samplingRate,
                features: this.features,
            }
            this.downloadConfig(config);
        },
        downloadConfig: async function(config) {
            const content = JSON.stringify(config);
            if (typeof showSaveFilePicker === 'undefined') {
                var a = document.createElement("a");
                a.href = window.URL.createObjectURL(new Blob([content], {type: "text/json"}));
                a.download = "config";
                a.click();
            }
            else {
                try {
                    const fileHandle = await self.showSaveFilePicker({
                        suggestedName: "config",
                        types: [{
                            description: 'JSON files',
                            accept: {
                            'text/json': ['.json'],
                            },
                        }],
                    });
                    const fileStream = await fileHandle.createWritable();
                    await fileStream.write(new Blob([content], {type: "text/plain;charset=utf-8"}));
                    await fileStream.close();
                } catch(error) {
                    console.log(error);
                }
            }
        }
    },
    watch: {
        toggleConfigDownload: function() {
            this.prepareConfigDownload();
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