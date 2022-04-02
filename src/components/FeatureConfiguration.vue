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
                            <button @click="modelImportButtonOnClick" type="button" class="btn btn-light main-btn">
                                <i class="fa-solid fa-folder"></i>
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
                            <button @click="configImportButtonOnClick" type="button" class="btn btn-light main-btn" :class="{disabled: featureModelFileName.length == 0}">
                                <i class="fa-solid fa-folder"></i>
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
                    <div class="separator-model"></div>
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
                        <div class="col-4 col-lg-5 my-auto">
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
                        <draggable :disbaled="false " :list="features" item-key="id" class="list-group p-0" ghost-class="ghost" >
                            <template #item="{ element  }">
                                <div class="list-group-item"> 
                                    {{ element.axis.name + "-" + element.feature.name + "-" + (element.slidingWindow*this.samplingRate)}}
                                    <button type="button" class="btn btn-default btn-circle me-1" @click="deleteFeature(element)">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>
            </div> 
            <div class="row justify-content-center my-3">
                <label for="annotationFileNameInput" class="col-5 col-lg-3 col-form-label">Annotation Filename</label>
                <div class="col-5 col-lg-3">
                    <input v-model="annotationFileName" type="text" class="form-control" id="annotationFileNameInput" :disabled="featureModelFileName.length == 0" required>
                </div>
            </div>
            <div class="row justify-content-center">
                <div class="col">
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
import features from "../util/model/ModelFunctions";
import * as tf from '@tensorflow/tfjs';
import draggable from "vuedraggable";
import AddFeature from "./AddFeature.vue";
import { db } from "/db";
import { createFeatureInstances } from "../util/model/ModelInstances";
import { createLabelsForAnnotation, createNewAnnotationFile, selectAnnotationFile } from "../util/DatabankManager";
import { checkImportedFiles } from "../util/model/ImportModelManager";

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
            annotationFileName: "ModelAnnotation",
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
        modelImportButtonOnClick() {
            document.getElementById("featureModelFileInput").click()
        },
        configImportButtonOnClick() {
            document.getElementById("featureConfigFileInput").click()
        },
        async onFeatureModelFileChange(e) {
            try {
                checkImportedFiles(e, this.modelLoaded);
            } catch (error) {
                this.setInvalidFeedback(error.message);
            }
            document.getElementById("featureModelFileInput").value = "";
        },
        onFeatureConfigFileChange(e) {
            const file = e.target.files[0];
            if ((file.name.toLowerCase().includes("configuration") || file.name.toLowerCase().includes("config")) && file.type.toLowerCase().includes("json")) {
                this.clearModelConfiguration();
                this.setModelConfiguration(file);
            }
            document.getElementById("featureConfigFileInput").value = "";
        },
        async modelLoaded(model, modelFileName, config) {
            this.featureModelFileName = modelFileName;
            this.model = model;
            this.features = [];
            if (config) {
                this.setModelConfiguration(config);
            }
        },
        setModelConfiguration(config) {
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
        clearModelConfiguration() {
            this.samplingRate = null;
            this.features = [];
            this.selectedDownsamplingMethod = "First";
        },
        featureExists(feature) {
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
        axisExists(axis) {
            const selectedData = this.$store.state.data[this.$store.state.selectedData];
            if (!selectedData) {
                return false;
            }
            const axes = selectedData.axes;
            for (const i in Object.values(axes)) {
                if (axes[i].name == axis.name && axes[i].id == axis.id) {
                    return true;
                }
            }
            return false;
        },
        addFeature(featureData) {
            this.features.push(featureData);
        },
        setInvalidFeedback(invalidFeedback) {
            this.$emit("setInvalidFeedback", invalidFeedback)
        },
        async onSubmit(e) {
            this.loading = true;
            e.preventDefault();
            if (!this.validateInputs()) {
                this.loading = false;
                return;
            }
            setTimeout(() => this.loadDataIntoModel(), 100);
        },
        async loadDataIntoModel() {
            let result;
            try {
                result = createFeatureInstances(this.$store.state.data[this.$store.state.selectedData], this.features, this.samplingRate, this.selectedDownsamplingMethod);
            } catch (error) {
                this.loading = false;
                this.$emit("setInvalidFeedback", error.messageback);
                return;
            }
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
                this.setInvalidFeedback(error.message);
                return;
            }
            // create annotation file
            const annotationId = await createNewAnnotationFile(this.annotationFileName);
            // create as many labels as needed
            const labelAmount = predictedValues[0].data[0].length;
            await createLabelsForAnnotation(annotationId, labelAmount, this.$store.state.colors);
            // create all the areas
            const allLabels = await db.labels.where("annoId").equals(annotationId).toArray();
            let timestamp = this.$store.state.data[this.$store.state.selectedData].timestamps[0] + 1000*offsetInSeconds;
            let nextTimestamp;
            predictedValues[0].data.forEach(prediction => {
                nextTimestamp = timestamp + 1000*smallestFeatureWindow;
                let max = Math.max(...prediction);
                if(max) {
                    let index = prediction.indexOf(max);
                    const label = allLabels[index];
                    db.areas.add({
                        annoId: annotationId,
                        labelId: label.id,
                        firstTimestamp: timestamp,
                        secondTimestamp: nextTimestamp,
                        y1: 0,
                        y2: 1,
                        yAmount: 1,
                    });
                    db.areas.add({
                        annoId: annotationId,
                        labelId: label.id,
                        firstTimestamp: timestamp,
                        secondTimestamp: nextTimestamp,
                        yAmount: null,
                    });
                }
                timestamp = nextTimestamp;
            });
            await selectAnnotationFile(annotationId);
            if (!this.$store.state.areasVisible) {
                this.$store.commit("toggleAreasVisibility");
            }
            this.loading = false;
            this.$emit("closeModal");
        },
        validateInputs() {
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
                this.setInvalidFeedback(invalidFeedback)
                return false;
            }
        },
        deleteFeature(feature) {
            const index = this.features.indexOf(feature);
            this.features.splice(index, 1);
        },
        prepareConfigDownload() {
            const config = {
                samplingRate: this.samplingRate,
                features: this.features,
            }
            this.downloadConfig(config);
        },
        async downloadConfig(config) {
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
</script>

<style scoped>
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
    padding: 0px;
    font-size: 0.75rem;
}
</style>