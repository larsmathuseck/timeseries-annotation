<template>
    <div class="modal fade" ref="ImportModelModal" tabindex="-1" aria-hidden="false">
        <div class="modal-dialog modal-dialog-scrollable modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Model Configuration</h4>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
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
                                    <label id="importedModelLabel" class="col-form-label p-0"> {{ modelFileName.length > 0 ? modelFileName : 'No Model selected yet' }}</label>
                                </div>
                            </div>
                            <div class="row-justify-content-center">
                                <div class="col-12">
                                    <div class="separator"></div>
                                </div>
                            </div>
                            <div class="row justify-content-center">
                                <div class="col-auto">
                                    <h5>Model Options:</h5>
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
                                            <input v-model="windowShift" type="number" class="form-control" id="overlapValue" placeholder="1" :disabled="modelFileName.length == 0" required>
                                        </div>
                                        <label class="col-4 col-lg-3 col-form-label text-left">Seconds</label>
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
                        <div class="row justify-content-center" v-show="showInvalidFeedback.length > 0">
                            <div class="col-12">
                                <div class="alert alert-danger p-1" role="alert">
                                    {{ showInvalidFeedback }}
                                </div>
                            </div>
                        </div>
                        <button id="submitFormBtn" hidden></button>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="loadDataIntoModel">Load Data in Model</button>
                    <button id="saveBtn" type="button" class="btn btn-primary" @click="submitForm">{{ saveBtnText }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Modal } from 'bootstrap'
import * as tf from '@tensorflow/tfjs';
import createInstances from "../model/ModelFunctions";
import { db } from "/db";

export default {
    name: "ImportModelModal",
    data() {
        this.model = null;
        return {
            modal: null,
            modelFileName: "",
            slidingWindow: null,
            samplingRate: null,
            windowShift: null,
            showInvalidFeedback: "",
            saveBtnText: "",
            selectedAxes: [],
        }
    },
    props: {
        toggleModelModalVisibility: Boolean,
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
            if (this.model == null) {
                this.showInvalidFeedback = "Nothing to save here. No model uploaded yet!"
                return;
            }
            if (this.windowShift >= this.slidingWindow) {
                this.showInvalidFeedback = "Window Shift must be smaller than Sliding Window!";
                return;
            }
            if (this.windowShift < 0) {
                this.showInvalidFeedback = "Window Shift can not be a negative Number!";
                return;
            }
            if (this.windowShift != 0 && this.slidingWindow % this.windowShift != 0) {
                this.showInvalidFeedback = "Sliding Window must be a multiple from Window Shift!";
                return;
            }
            if (this.selectedAxes.length == 0) {
                this.showInvalidFeedback = "At least one Axis has to be chosen!";
                return;
            }
            this.saveBtnText = "Saved!"
        },
        loadDataIntoModel: async function() {
            const data = this.$store.state.data;
            if (this.model == null) {
                this.showInvalidFeedback = "No Model imported yet!"
                return;
            }
            if (data.length == 0) {
                this.showInvalidFeedback = "Please Upload data first!"
                return;
            }
            document.getElementById("saveBtn").click();
            if (this.saveBtnText == "Saved!") {
                const modelConfiguration = {
                    slidingWindow: this.slidingWindow,
                    samplingRate: this.samplingRate,
                    windowShift: this.windowShift,
                    selectedAxes: this.selectedAxes,
                };

                const result = createInstances(this.$store.state, modelConfiguration);
                const instances = result[0];
                const timeStampsForInstances = result[1];
                console.log("instances:", instances)
                console.log("timestamps for Instances: ", timeStampsForInstances);
                let predictedValues;
                try {
                    const tensor = tf.tensor(instances);
                    const a = this.model.predict(tensor);
                    a.print();
                    predictedValues = a.arraySync();
                    console.log("predicted Values: ", predictedValues);
                } catch (error) {
                    console.error(error.message);
                    this.showInvalidFeedback = error.message;
                    return;
                } 
                // create annotation file
                const annotationId = await this.createNewAnnotationFile();
                console.log("created annotationId: ", annotationId);
                // create as many labels as needed
                await this.createLabelsForAnnotation(annotationId, predictedValues[0].length);
                // create all the areas
                const allLabels = await db.labels.where("annoId").equals(annotationId).toArray();
                console.log(allLabels);
                for (let i = 0; i < predictedValues.length; i++) {
                    const value = predictedValues[i];
                    const labelNumber = value.indexOf(Math.max(...value));
                    console.log("add label: ", i+1);
                    console.log(value);
                    const label = allLabels[labelNumber];
                    console.log(label);
                    db.areas.add({
                        annoId: annotationId,
                        labelId: label.id,
                        firstTimestamp: timeStampsForInstances[i][0],
                        secondTimestamp: timeStampsForInstances[i][1],
                    });
                }
                // // annotate predicted values in the chart
                // for (let i = 0; i < predictedValues.length; i++) {
                //     const value = predictedValues[i];
                //     const label = value.indexOf(Math.max(...value));
                //     console.log("add label: ", i+1)
                //     console.log(value);
                //     await this.addAnnotationPointFromModel(timeStampsForInstances[i], label);
                // }
                // this.modal.hide();
            }
        },
        createNewAnnotationFile: async function() {
            return await db.annotations.add({
                name: "AnnotationCreatedByModel",
                lastAdded: {},
            });
        },
        createLabelsForAnnotation: async function(annotationId, amountOfLabels) {
            for (let i = 0; i < amountOfLabels; i++) {
                const label = await db.labels.add({
                    name: "label_" + i,
                    color: this.$store.state.colors[i % this.$store.state.colors.length],
                    annoId: annotationId,
                });
                console.log("label id: ", label);
            }
        },
        addAnnotationPointFromModel: async function(timestamp, label) {
            console.log("in addAnnotationFromModel")
            let time = new Date(timestamp).getTime();
            const currAnn = await db.lastSelected.where('id').equals(1).first();
            console.log(currAnn);
            console.log(label);
            if (label != null && currAnn != undefined) {
                console.log("add to db: ", {labelId: label.id, annoId: currAnn.annoId, timestamp: time});
                db.annoData.add({labelId: label.id, annoId: currAnn.annoId, timestamp: time});
                console.log("added!")
            }
        },
        closeModal: function() {
            this.modal.hide();
        }
    },
    watch: {
        toggleModelModalVisibility: function() {
            this.showInvalidFeedback = "";
            this.saveBtnText = "Save";
            this.modal.show();
        },
    },
    computed: {
        axes: function() {
            return this.$store.getters.getAxes;
        },
    },
    mounted() {
        this.modal = new Modal(this.$refs.ImportModelModal);
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
.modal-body {
    overflow-y: auto;
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

p {
    margin-bottom: 0.5rem;
}
</style>
