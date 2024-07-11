<template>
    <form id="modelConfigurationSubmit" @submit="onSubmit">
        <div class="container-fluid p-0">
            <div class="row justify-content-center">
                <div class="col-auto">
                    <h5 class="form-label">Import Model from File</h5>
                </div>
            </div>
            <div class="row">
                <div class="col-xl-2"></div>
                <div class="col-6 col-xl-4">
                    <div class="row justify-content-center mb-4">
                        <div class="col-auto">
                            <input id="modelFileInput" type="file" webkitdirectory directory v-on:change="onModelFileChange" hidden>
                            <button @click="modelImportButtonOnClick" type="button" class="btn btn-light main-btn">
                                <i class="fa-solid fa-folder"></i>
                                Choose Directory
                            </button>
                        </div>
                    </div>
                    <div class="row justify-content-center mb-2">
                        <div class="col-auto my-auto">
                            <p class="m-0"> {{ modelFileName.length > 0 ? modelFileName : 'No Model imported' }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-xl-4">
                    <div class="row justify-content-center mb-3">
                        <div class="col-auto">
                            <input id="configFileInput" type="file" v-on:change="onConfigFileChange" hidden>
                            <button @click="configImportButtonOnClick" type="button" class="btn btn-light main-btn" :class="{disabled: modelFileName.length == 0}">
                                <i class="fa-solid fa-folder"></i>
                                Import Config File
                            </button>
                        </div>
                    </div>
                    <div class="row justify-content-center mb-2">
                        <div class="col-auto my-auto">
                            <p class="m-0"> {{ configName.length > 0 ? configName : 'No Config imported' }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-xl-2"></div>
            </div>
            <div class="row-justify-content-center">
                <div class="col-12">
                    <div class="separator-model"></div>
                </div>
            </div>
            <div class="row">
                <div class="col-12 col-lg-6">
                    <div class="row mb-3 justify-content-center">
                        <label for="slidingWindowInput" class="col-6 col-form-label">Sliding Window</label>
                        <div class="col-2 col-lg-3">
                            <input v-model="slidingWindow" type="text" class="form-control" id="slidingWindowInput" placeholder="4" :disabled="modelFileName.length == 0" required>
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
                        <label for="windowShiftInput" class="col-6 col-form-label">Window Shift</label>
                        <div class="col-2 col-lg-3">
                            <input v-model="windowShift" type="text" class="form-control" id="windowShiftInput" placeholder="1" :disabled="modelFileName.length == 0" required>
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
                    <div class="row">
                        <div class="container-fluid">
                            <p>Axis Selection</p>
                            <div class="row justify-content-center">
                                <div class="list-group px-2">
                                    <label class="list-group-item" v-for="axis in axes" :key="axis.id">
                                        <input class="form-check-input me-1" type="checkbox" v-bind:value="{id: axis.id, name: axis.name}" v-model="selectedAxes" :disabled="modelFileName.length == 0">
                                        {{ axis.name }}
                                    </label>
                                </div>
                            </div>
                            <div class="row justify-content-center">
                                <div class="col-auto">
                                    <label class="pe-2" v-for="axis in selectedAxes" :key="axis.id">
                                        {{ (selectedAxes.indexOf(axis) + 1) + ". " + axis.name + ",\t"}}
                                    </label>
                                </div>
                            </div>
                            <div class="row justify-content-center py-3">
                                <div class="col-auto">
                                    <button type="button" class="btn btn-danger" @click="resetAxisSelection">Clear Axis Selection</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row justify-content-center my-3">
            <label for="annotationFileNameInput" class="col-5 col-lg-3 col-form-label">Annotation Filename</label>
            <div class="col-5 col-lg-3">
                <input v-model="annotationFileName" type="text" class="form-control" id="annotationFileNameInput" :disabled="modelFileName.length == 0" required>
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
</template>

<script>
import * as tf from '@tensorflow/tfjs';
import { db } from "/db";
import { createInstances } from "../../../util/model/ModelInstances.js";
import { checkImportedFiles } from "../../../util/model/ImportModelManager.js";
import { createNewAnnotationFile, createLabelsForAnnotation, selectAnnotationFile } from "../../../util/DatabankManager.js";
import { download } from "../../../util/InputOutput.js";

export default {
    name: "TfaModelConfiguration",
    data() {
        this.model = null;
        return {
            modelFileName: "",
            configName: "",
            annotationFileName: "ModelAnnotation",
            slidingWindow: null,
            samplingRate: null,
            windowShift: null,
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
        modelImportButtonOnClick() {
            document.getElementById("modelFileInput").click();
        },
        configImportButtonOnClick() {
            document.getElementById("configFileInput").click();
        },
        onModelFileChange(e) {
            try {
                checkImportedFiles(e, this.modelLoaded);
            } catch (error) {
                console.error(error.message);
                this.setInvalidFeedback(error.message);
            }
            document.getElementById("modelFileInput").value = "";
        },
        onConfigFileChange(e) {
            const file = e.target.files[0];
            if ((file.name.toLowerCase().includes("configuration") || file.name.toLowerCase().includes("config")) && file.type.toLowerCase().includes("json")) {
                this.clearModelConfiguration();
                this.setModelConfiguration(file);
            }
            document.getElementById("configFileInput").value = "";
        },
        async modelLoaded(model, modelFileName, config) {
            this.modelFileName = modelFileName;
            this.model = model;
            this.selectedAxes = [];
            if (config) {
                this.setModelConfiguration(config);
            }
        },
        setModelConfiguration(config) {
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
        clearModelConfiguration() {
            this.slidingWindow = null;
            this.samplingRate = null;
            this.windowShift = null;
            this.selectedDownsamplingMethod = "First";
            this.selectedAxes = [];
        },
        axisExists(axis) {
            const axes = this.axes;
            for (const i in Object.values(axes)) {
                if (axes[i].name == axis.name && axes[i].id == axis.id) {
                    return true;
                }
            }
            return false;
        },
        resetAxisSelection() {
            this.selectedAxes = [];
        },
        setInvalidFeedback(invalidFeedback) {
            this.$emit("setInvalidFeedback", invalidFeedback)
        },
        onSubmit(e) {
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
            }
            setTimeout(() => this.loadDataIntoModel(modelConfiguration), 10);
        },
        validateInputs() {
            let invalidFeedback = "";
            const data = this.$store.state.data;
            if (this.model == null) {
                invalidFeedback = "No Model imported yet!";
            }
            else if (isNaN(this.slidingWindow)) {
                invalidFeedback ="Sliding Window must be a number!";
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
            else if (this.isMultiple(this.samplingRate * this.windowShift, 1) != 0) {
                invalidFeedback = "Window Shift * Sampling Rate must be an Integer!";
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
                this.setInvalidFeedback(invalidFeedback)
                return false;
            }
        },
        async loadDataIntoModel(modelConfiguration) {
            const model = modelConfiguration.model;
            let instances;
            let slotsNumber = 0;
            try {
                // get converted data for use in model. Every instance includes the next window shift.
                instances = createInstances(this.$store.state, modelConfiguration);
                slotsNumber = instances[1] / (modelConfiguration.samplingRate * modelConfiguration.windowShift);
                instances = instances[0];
            } catch (error) {
                this.loading = false
                console.error(error.message);
                this.setInvalidFeedback(error.message)
            }
            let predictedValues = [];
            try {
                // make predictions
                instances.forEach(instance => {
                    const tensor = tf.tensor(instance[1]);
                    const a = model.predict(tensor);
                    predictedValues.push({data: a.arraySync(), timestamps: instance[0]});
                });
            } catch (error) {
                this.loading = false;
                console.error(error.message);
                this.setInvalidFeedback(error.message)
                return;
            }
            // create annotation file
            const annotationId = await createNewAnnotationFile(this.annotationFileName);
            // create as many labels as needed
            const labelAmount = predictedValues[0].data[0].length;
            await createLabelsForAnnotation(annotationId, labelAmount, this.$store.state.colors);
            // create all the areas
            const allLabels = await db.labels.where("annoId").equals(annotationId).toArray();
            let predIndex = 0;
            // evaluate predictions and add areas to db
            predictedValues.forEach(prediction => {
                for (let i = 0; i < prediction.data.length; i++) {
                    const max = Math.max(...prediction.data[i]);
                    if(max) {
                        const index = prediction.data[i].indexOf(max);
                        const label = allLabels[index];
                        db.areas.add({
                            annoId: annotationId,
                            labelId: label.id,
                            firstTimestamp: prediction.timestamps[i][0],
                            secondTimestamp: prediction.timestamps[i][1],
                            y1: predIndex,
                            y2: predIndex+1,
                            yAmount: predictedValues.length,
                        });
                    }
                }
                predIndex += 1;
            })
            // create majority vote overview shown at bottom of the graph
            if(modelConfiguration.windowShift > 0) {
                await this.addCompleteResultOverview(predictedValues, slotsNumber, allLabels, annotationId, modelConfiguration.windowShift, predIndex);
            }
            // select newly created annotaion file
            await selectAnnotationFile(annotationId);
            if (!this.$store.state.areasVisible) {
                this.$store.commit("toggleAreasVisibility");
            }
            this.loading = false;
            this.$emit("closeModal");
        },
        async addCompleteResultOverview(predictedValues, slotsNumber, allLabels, annotationId, windowShift, predIndex) {
            let timestamp = predictedValues[0].timestamps[0][0];
            // two dimensional array that saves the current position for every prediction (windowShift)
            let currentPosition = [];
            for(let i = 0; i < predictedValues.length; i++) {
                currentPosition.push(null);
            }
            for(let i = 0; i < slotsNumber; i++) {
                let position = i%predictedValues.length;
                // update current positions of the prediction arrays
                if(currentPosition[position] == null) {
                    currentPosition[position] = 0;
                }
                else{
                    currentPosition[position] += 1;
                    if(currentPosition[position] >= predictedValues[0].data.length) {
                        currentPosition[position] = null;
                    }
                }
                let indices = {};
                // evaluate predicitons for current position
                for(let j = 0; j < predictedValues.length; j++) {
                    let data = predictedValues[j].data[currentPosition[j]];
                    let index = data?.indexOf(Math.max(...data));
                    let label = allLabels[index]?.id;
                    if(label == null) {
                        continue;
                    }
                    else {
                        if (!indices[label]) {
                            indices[label] = 1;
                        } else {
                            indices[label] += 1;
                        }
                    }
                }
                // set result, null when likelyhood for all the predictions for the position the same
                let result = Object.keys(indices).reduce(function(a, b) {
                    if(indices[a] > indices[b]) {
                        return a;
                    }
                    else if(indices[a] < indices[b]) {
                        return b;
                    }
                    else{
                        return null;
                    }
                });
                // add areas to db
                if(result != null) {
                    db.areas.add({
                            annoId: annotationId,
                            labelId: parseInt(result),
                            firstTimestamp: timestamp,
                            secondTimestamp: timestamp + windowShift*1000,
                            y1: predIndex,
                            y2: predIndex+1,
                            yAmount: null,
                        });
                }
                timestamp += windowShift*1000;
            }
        },
        isMultiple(a, b) {
            // this function is needed, since the normal Javascript modulo seem to not work like expected. With this we only check if the result of division is an float by searching for a comma.
            const temp = (a/b).toString();
            const commaIndex = temp.indexOf(".");
            return commaIndex == -1 ? 0 : commaIndex;
        },
        prepareConfigDownload() {
            const config = {
                slidingWindow: this.slidingWindow,
                samplingRate: this.samplingRate,
                windowShift: this.windowShift,
                downsamplingMethod: this.selectedDownsamplingMethod,
                selectedAxes: this.selectedAxes,
            }
            download(JSON.stringify(config), "text/json", {'text/json': ['.json']}, "config.json");
        },
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
</script>

<style scoped>
input {
    text-align: center;
}

.text-left {
    text-align: left;
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
</style>