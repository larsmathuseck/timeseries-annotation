<template>
    <form id="modelConfigurationSubmit" @submit="onSubmit">
        <div class="container-fluid p-0">
            <div class="row justify-content-center">
                <div class="col-auto">
                    <h5 class="form-label">Import Model from File</h5>
                </div>
            </div>
            <div class="row justify-content-center">
                <div class="col-auto">
                    <input id="modelFileInput" type="file" webkitdirectory directory v-on:change="onFileChange" hidden>
                    <button @click="importButtonOnClick" type="button" class="btn btn-light styled-btn">
                        <i class="fa fa-folder"></i>
                        Choose Directory
                    </button>
                </div>
                <div class="col-auto my-auto">
                    <p class="m-0"> {{ modelFileName.length > 0 ? modelFileName : 'No Model selected yet' }}</p>
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
                <button type="submit" class="btn btn-primary">Load Data in Model</button>
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
            slidingWindow: null,
            samplingRate: null,
            windowShift: null,
            inputsFilledOut: false,
            selectedAxes: [],
            downsamplingMethods: ["First", "Last", "Median"],
            selectedDownsamplingMethod: "First",
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
        onSubmit: function(e) {
            e.preventDefault();
            if (!this.validateInputs()) {
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
            const data = this.$store.state.data;
            const model = modelConfiguration.model;

            const instances = createInstances(this.$store.state, modelConfiguration);
            console.log(instances);
            let slotsNumber;
            if(modelConfiguration.windowShift == 0){
                slotsNumber = instances[0].length;
            }
            else{
                slotsNumber = instances[0].length*modelConfiguration.slidingWindow/modelConfiguration.windowShift;
            }
            let predictedValues = [];
            try {
                instances.forEach(instance => {
                    const tensor = tf.tensor(instance);
                    const a = model.predict(tensor);
                    predictedValues.push({data: a.arraySync(), timestamps: instance.timestamps});
                });                
            } catch (error) {
                this.showInvalidFeedback = error.message;
                return;
            }
            console.log(predictedValues);
            let currentPosition = [];
            for(let i = 0; i < predictedValues.length; i++){
                currentPosition.push(null);
            }
            let predictions = [];
            for(let i = 0; i < slotsNumber; i++){
                let position = i%predictedValues.length;
                if(currentPosition[position] == null){
                    currentPosition[position] = 0;
                }
                else{
                    currentPosition[position] += 1;
                    if(currentPosition[position] >= predictedValues[0].data.length){
                        currentPosition[position] = null;
                    }
                }
                let indices = {};
                for(let j = 0; j < predictedValues.length; j++){
                    let data = predictedValues[j].data[currentPosition[j]];
                    let index = data?.indexOf(Math.max(...data));
                    if(index == null){
                        continue;
                    }
                    else {
                        if (!indices[index]) {
                            indices[index] = 1;
                        } else {
                            indices[index] += 1;
                        }
                    }
                }
                console.log(indices);
                let result = Object.keys(indices).reduce(function(a, b){ 
                    if(indices[a] == indices[b]){
                        // if(a == 'undecided'){
                            //     return b;
                        // }
                        // else if(b == 'undecided'){
                        //     return a;
                        // }
                        // else{
                            //createLabel("undecided_" + a + "_" + b, annotationId);
                            return [a, b];
                        // }
                    }
                    else if(indices[a] > indices[b]){
                        return a;
                    }
                    else{
                        return b; 
                    }
                });
                predictions.push(result);
            }
            // create annotation file
            const annotationId = await this.createNewAnnotationFile();
            // create all the areas
            let timestamp = data[this.$store.state.currentSelectedData].timestamps[0];
            let nextTimestamp;
            for (let index = 0; index < predictions.length; index++) {
                let prediction = predictions[index];
                if(modelConfiguration.windowShift == 0){
                    nextTimestamp = timestamp + 1000*modelConfiguration.slidingWindow;
                }
                else{
                    nextTimestamp = timestamp + 1000*modelConfiguration.windowShift
                }
                if (prediction != 'undecided') {
                    let labelName = "";
                    let labelId;
                    if (Array.isArray(prediction)) {
                        const labelArray = [];
                        for (let i = 0; i < prediction.length; i++) {
                            labelArray.push(prediction[i]);
                        }
                        labelName = "undecided_";
                        for (let i = 0; i < labelArray.length; i++) {
                            if (labelArray[i] == "undecided") {
                                labelName = "undecided_label";
                                break;
                            }
                            labelName += parseInt(labelArray[i]) + 1;
                            if (i != labelArray.length-1) {
                                labelName += "_";
                            }
                        }
                        labelId = await this.getOrCreateLabel(labelName, annotationId);
                    }
                    else {
                        labelName = "prediction_" + (parseInt(prediction) + 1);
                        labelId = await this.getOrCreateLabel(labelName, annotationId);
                    }
                    db.areas.add({
                        annoId: annotationId,
                        labelId: labelId,
                        firstTimestamp: timestamp,
                        secondTimestamp: nextTimestamp,
                    });
                }
                timestamp = nextTimestamp;
            }
            db.lastSelected.update(1, {annoId: parseInt(annotationId)});
            if (!this.$store.state.areasVisible) {
                this.$store.commit("toggleAreasVisibility");
            }
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
    },
    computed: {
        axes: function() {
            return this.$store.getters.getAxes;
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