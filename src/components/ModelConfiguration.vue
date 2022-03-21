<template>
    <form id="modelConfigurationSubmit" @submit="onSubmit">
        <div class="container-fluid p-0">
            <div class="row justify-content-center">
                <div class="col-auto">
                    <h5 class="form-label">Import Model from File</h5>
                </div>
            </div>
            <div class="row">
                <div class="col-6">
                    <div class="row justify-content-end">
                        <div class="col-auto">
                            <input id="modelFileInput" type="file" webkitdirectory directory v-on:change="onModelFileChange" hidden>
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
                            <p class="m-0"> {{ modelFileName.length > 0 ? modelFileName : 'No Model imported' }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-6">
                    <div class="row justify-content-end">
                        <div class="col-auto">
                            <input id="configFileInput" type="file" v-on:change="onConfigFileChange" hidden>
                            <button @click="configImportButtonOnClick" type="button" class="btn btn-light styled-btn" :class="{disabled: modelFileName.length == 0}">
                                <i class="fa fa-folder"></i>
                                Import Config File
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-6 my-auto">
                    <div class="row justify-content-start">
                        <div class="col-auto my-auto">
                            <p class="m-0"> {{ configName.length > 0 ? configName : 'No Config imported' }}</p>
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
                        <label for="selectedDownsamplingMethod" class="col-6 col-form-label">Downsampling Method</label>
                        <div class="col-5 col-lg-6">
                            <select v-model="selectedDownsamplingMethod" id="selectedDownsamplingMethod" ref="select" class="form-select" :disabled="modelFileName.length == 0">
                                <option v-for="method in downsamplingMethods" :key="method" v-bind:value="method" >
                                    {{ method }}
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
        <div class="row justify-content-center">
            <div class="col-auto">
                <button type="submit" class="btn btn-primary">
                    <div v-if="loading" class="spinner-border spinner-border-sm"></div>
                    Load Data in Model
                </button>
            </div>
        </div>
    </form>
</template>

<script>
import * as tf from '@tensorflow/tfjs';
import { createInstances } from "../model/ModelInstances";
import { db } from "/db";

export default {
    name: "ModelConfiguration",
    data() {
        this.model = null;
        return {
            modelFileName: "",
            configName: "",
            slidingWindow: null,
            samplingRate: null,
            windowShift: null,
            inputsFilledOut: false,
            selectedAxes: [],
            downsamplingMethods: ["First", "Last", "Median"],
            selectedDownsamplingMethod: "First",
            loading: false,
        }
    },
    props: {
        toggleConfigDownload: Boolean,
    },
    methods: {
        modelImportButtonOnClick: function() {
            document.getElementById("modelFileInput").click();
        },
        configImportButtonOnClick: function() {
            document.getElementById("configFileInput").click();
        },
        onModelFileChange: function(e) {
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
        onConfigFileChange: function(e) {
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
            this.modelFileName = modelFileName;
            this.model = model;
            this.selectedAxes = [];
            if (config) {
                this.setModelConfiguration(config);
            }
        },
        setModelConfiguration: function(config) {
            this.configName = config.name;
            const reader = new FileReader();
            reader.readAsText(config);
            reader.onload = async () => {
                const json = JSON.parse(reader.result);
                this.slidingWindow = json.slidingWindow;
                this.samplingRate = json.samplingRate;
                this.windowShift = json.windowShift;
                this.selectedDownsamplingMethod = json.downsamplingMethod || this.selectedDownsamplingMethod;
                const selectedAxes = json.selectedAxes;
                if (selectedAxes) {
                    selectedAxes.forEach(axis => {
                        if (this.axisExists(axis)) {
                            this.selectedAxes.push(axis);
                        }
                    });
                }
            }
        },
        clearModelConfiguration: function() {
            this.slidingWindow = null;
            this.samplingRate = null;
            this.windowShift = null;
            this.selectedDownsamplingMethod = "First";
            this.selectedAxes = [];
        },
        axisExists: function(axis) {
            const axes = this.axes;
            for (let i = 0; i < axes.length; i++) {
                if (axes[i].name == axis.name && axes[i].id == axis.id) {
                    return true;
                }
            }
            return false;
        },
        onSubmit: function(e) {
            this.loading = true;
            e.preventDefault();
            if (!this.validateInputs()) {
                this.loading = false;
                return;
            }
            const modelConfiguration = {
                    model: this.model,
                    slidingWindow: this.slidingWindow,
                    samplingRate: this.samplingRate,
                    windowShift: this.windowShift,
                    selectedAxes: this.selectedAxes,
                    downsamplingMethod: this.selectedDownsamplingMethod,
            };
            this.loadDataIntoModel(modelConfiguration);
        },
        validateInputs: function() {
            let invalidFeedback = "";
            const data = this.$store.state.data;
            if (this.model == null) {
                invalidFeedback = "No Model imported yet!";
            }
            else if (this.slidingWindow < 0) {
                invalidFeedback = "Sliding Window can not be a negative Number!";
            }
            else if (this.samplingRate < 0) {
                invalidFeedback = "Sampling Rate can not be a negative Number!";
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
        loadDataIntoModel: async function(modelConfiguration) {
            const model = modelConfiguration.model;
            let instances;
            try {
                instances = createInstances(this.$store.state, modelConfiguration);
            } catch (error) {
                this.loading = false
                this.$emit("setInvalidFeedback", error.message)
            }
            let predictedValues = [];
            try {
                instances.forEach(instance => {
                    const tensor = tf.tensor(instance[1]);
                    const a = model.predict(tensor);
                    predictedValues.push({data: a.arraySync(), timestamps: instance[0]});
                });                
            } catch (error) {
                this.loading = false;
                this.$emit("setInvalidFeedback", error.message)
                return;
            }
            console.log(predictedValues);
            // create annotation file
            const annotationId = await this.createNewAnnotationFile();
            // create as many labels as needed
            const labelAmount = predictedValues[0].data[0].length;
            await this.createLabelsForAnnotation(annotationId, labelAmount);
            // create all the areas
            const allLabels = await db.labels.where("annoId").equals(annotationId).toArray();
            const areaHeight = 77 / predictedValues.length;
            let predIndex = 0;
            predictedValues.forEach(prediction => {
                for (let i = 0; i < prediction.data.length; i++) {
                    const max = Math.max(...prediction.data[i]);
                    if(max){
                        const index = prediction.data[i].indexOf(max);
                        const label = allLabels[index];
                        db.areas.add({
                            annoId: annotationId,
                            labelId: label.id,
                            firstTimestamp: prediction.timestamps[i][0],
                            secondTimestamp: prediction.timestamps[i][1],
                            y1: 4.5 + predIndex*areaHeight,
                            y2: 4.5 + (predIndex+1) * areaHeight,
                        });
                    }
                }
                predIndex += 1;
            })
            db.lastSelected.update(1, {annoId: parseInt(annotationId)});
            if (!this.$store.state.areasVisible) {
                this.$store.commit("toggleAreasVisibility");
            }
            this.loading = false;
            this.$emit("closeModal");
        },
        createNewAnnotationFile: async function() {
            const annotations = await db.annotations.toArray();
            let counter = 0;
            annotations.forEach(annotation => {
                if (annotation.name.includes("ModelAnnotation")) {
                    counter ++;
                }
            });
            let name = "ModelAnnotation";
            if (counter != 0) {
                name += "(" + counter + ")";
            }
            return await db.annotations.add({
                name: name,
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
        getOrCreateLabel: async function(labelName, annotationId) {
            const amountOfLabels = await db.labels.where("annoId").equals(annotationId).toArray();
            const labelsWithName = await db.labels.where("[annoId+name]").equals([annotationId, labelName]).toArray();
            if (labelsWithName.length == 0) {
                return await db.labels.add({
                    name: labelName,
                    color: this.$store.state.colors[amountOfLabels.length % this.$store.state.colors.length],
                    annoId: annotationId,
                });
            } else {
                return labelsWithName[0].id;
            }
        },
        isMultiple: function(a, b) {
            // this function is needed, since the normal Javascript modulo seem to not work like expected. With this we only check if the result of division is an float by searching for a comma.
            const temp = (a/b).toString();
            const commaIndex = temp.indexOf(".");
            return commaIndex == -1 ? 0 : commaIndex;
        },
        prepareConfigDownload: function() {
            const config = {
                slidingWindow: this.slidingWindow,
                samplingRate: this.samplingRate,
                windowShift: this.windowShift,
                downsamplingMethod: this.selectedDownsamplingMethod,
                selectedAxes: this.selectedAxes,
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
    computed: {
        axes: function() {
            return this.$store.getters.getAxes;
        },
    },
    watch: {
        toggleConfigDownload: function() {
            this.prepareConfigDownload();
        },
    },
    emits: ["closeModal", "setInvalidFeedback"],
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