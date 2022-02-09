<template>
    <div class="modal fade" ref="ImportModelModal" tabindex="-1" aria-hidden="false">
        <div class="modal-dialog modal-dialog-scrollable modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">{{ showModelConfiguration == true ? "Model Configuration" : "Feature Configuration"}}</h4>
                    <label class="switch">
                        <input type="checkbox" v-model="showModelConfiguration" v-show="false">
                        <span class="slider round"></span>
                    </label>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ModelConfiguration v-show="showModelConfiguration" @loadDataIntoModel="loadDataIntoModel" @setInvalidFeedback="setInvalidFeedback" />
                    <!-- <FeatureConfiguration v-show="!showModelConfiguration" /> -->
                    <div class="row justify-content-center" v-show="showInvalidFeedback.length > 0">
                        <div class="col-12">
                            <div class="alert alert-danger p-1 m-3" role="alert">
                                {{ showInvalidFeedback }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="closeModal">Close</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Modal } from 'bootstrap'
import * as tf from '@tensorflow/tfjs';
import { createInstances } from "../model/ModelInstances";
import { db } from "/db";
import ModelConfiguration from "./ModelConfiguration.vue";
//import FeatureConfiguration from "./FeatureConfiguration.vue";

export default {
    name: "ImportModelModal",
    components: {
        ModelConfiguration,
        //FeatureConfiguration,
    },
    data() {
        return {
            modal: null,
            showModelConfiguration: true,
            showInvalidFeedback: "",
        }
    },
    props: {
        toggleModelModalVisibility: Boolean,
    },
    methods: {
        loadDataIntoModel: async function(modelConfiguration) {
            const data = this.$store.state.data;
            const model = modelConfiguration.model;

            const instances = createInstances(this.$store.state, modelConfiguration);
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
                    else if(data[index] < this.acceptedPercent * 0.01){
                        if (!indices.undecided) {
                            indices.undecided = 1;
                        } else {
                            indices.undecided += 1;
                        }
                    }
                    else {
                        if (!indices[index]) {
                            indices[index] = 1;
                        } else {
                            indices[index] += 1;
                        }
                    }
                }
                let result = Object.keys(indices).reduce(function(a, b){ 
                    if(indices[a] == indices[b]){
                        // if(a == 'undecided'){
                        //     return b;
                        // }
                        // else if(b == 'undecided'){
                        //     return a;
                        // }
                        // else{
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
            // create as many labels as needed
            const labelAmount = predictedValues[0].data[0].length + 1;
            await this.createLabelsForAnnotation(annotationId, labelAmount);
            // create all the areas
            const allLabels = await db.labels.where("annoId").equals(annotationId).toArray();
            let timestamp = data[this.$store.state.currentSelectedData].timestamps[0];
            let nextTimestamp;
            predictions.forEach(prediction => {
                if(modelConfiguration.windowShift == 0){
                    nextTimestamp = timestamp + 1000*modelConfiguration.slidingWindow;
                }
                else{
                    nextTimestamp = timestamp + 1000*modelConfiguration.windowShift
                }
                if(prediction != 'undecided'){
                    if(Array.isArray(prediction)){
                        prediction = labelAmount-1;
                    }
                    const label = allLabels[prediction];
                    db.areas.add({
                        annoId: annotationId,
                        labelId: label.id,
                        firstTimestamp: timestamp,
                        secondTimestamp: nextTimestamp,
                    });
                }
                timestamp = nextTimestamp;
            });
            this.modal.hide();
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
        setInvalidFeedback: function(invalidFeedback) {
            this.showInvalidFeedback = invalidFeedback;
        },
        closeModal: function() {
            this.modal.hide();
        },
    },
    watch: {
        toggleModelModalVisibility: function() {
            this.showInvalidFeedback = "";
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
</script>

<style scoped>
.modal-body {
    overflow-y: auto;
}

.switch {
  position: relative;
  display: inline-block;
  width: 3vw;
  height: 1.5vw;
  margin-top: auto;
  margin-bottom: auto;
  margin-left: 1rem;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 1.15vw;
  width: 1.15vw;
  left: 0.25vw;
  bottom: 0.2vw;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(1.25vw);
  -ms-transform: translateX(1.25vw);
  transform: translateX(1.3vw);
}

.slider.round {
  border-radius: 1vw;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
