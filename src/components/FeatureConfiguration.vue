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
                                    {{ element.axis.name + "-" + element.feature.name + "-" + element.slidingWindow}}
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
            addFeatureVisible: false,
            samplingrate: null,
            features: [],
            drag: false,
            slidingWindow: 1,
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
        checkMove: function(e) {
            window.console.log("Future index: " + e.draggedContext.futureIndex);
        },
        onSubmit: async function(e) {
            e.preventDefault();
            if (!this.validateInputs()) {
                return;
            }
            // TODO load data into model via this.$emit in ImportModelModal
            const result = createFeatureInstances(this.$store.state.data[this.$store.state.currentSelectedData], this.features, 1, this.samplingrate);
            const instances = result[0];
            const offsetInSeconds = result[1];
            let predictedValues = [];
            try {
                const tensor = tf.tensor(instances);
                const a = this.model.predict(tensor);
                predictedValues.push({data: a.arraySync()});               
            } catch (error) {
                console.log(error);
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
                nextTimestamp = timestamp + 1000*this.slidingWindow;
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
            //this.modal.hide();
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
</style>