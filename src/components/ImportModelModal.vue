<template>
    <div class="modal fade" ref="ImportModelModal" tabindex="-1" aria-hidden="false">
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Model Configuration</h4>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>
                <form id="modelConfigurationSubmit" @submit="onSubmit">
                    <div class="modal-body">
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
                            <div class="row mb-3 justify-content-center">
                                <label for="slidingWindowInput" class="col-6 col-form-label text-left ps-3 pe-0">Sliding Window</label>
                                <div class="col-3">
                                    <input v-model="slidingWindow" type="number" class="form-control" id="slidingWindowInput" placeholder="4" :disabled="modelFileName.length == 0" required>
                                </div>
                                <label class="col-3 col-form-label text-left px-0">Seconds</label>
                            </div>
                            <div class="row mb-3 justify-content-center">
                                <label for="samplingRateInput" class="col-6 col-form-label text-left ps-3 pe-0">Sampling Rate</label>
                                <div class="col-3">
                                    <input v-model="samplingRate" type="number" class="form-control" id="samplingRateInput" placeholder="8" :disabled="modelFileName.length == 0" required>
                                </div>
                                <label class="col-3 col-form-label text-left px-0">Hertz</label>
                            </div>
                            <div class="row mb-3 justify-content-center">
                                <label for="overlapValue" class="col-6 col-form-label text-left ps-3 pe-0">Overlaping</label>
                                <div class="col-3">
                                    <input v-model="overlapping" type="number" class="form-control" id="overlapValue" placeholder="1" :disabled="modelFileName.length == 0" required>
                                </div>
                                <label class="col-3 col-form-label text-left px-0">Seconds</label>
                            </div>
                        </div>
                        <div class="row justify-content-center" v-show="showInvalidFeedback.length > 0">
                            <div class="col-12">
                                <div class="alert alert-danger p-1" role="alert">
                                    {{ showInvalidFeedback }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="loadDataIntoModel">Load Data in Model</button>
                        <button id="saveBtn" type="submit" class="btn btn-primary">{{ saveBtnText }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { Modal } from 'bootstrap'
import * as tf from '@tensorflow/tfjs';

export default {
    name: "ImportModelModal",
    data() {
        return {
            modal: null,
            modelFileName: "",
            slidingWindow: null,
            samplingRate: null,
            overlapping: null,
            showInvalidFeedback: "",
            saveBtnText: "",
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
        modelLoaded: function(model, modelFileName) {
            this.modelFileName = modelFileName;
            const instance = [[[-3.3523560e-02,  9.8258060e+00, -3.1604004e-01, -4.2724610e-04, 2.6702880e-03, -4.4250488e-04],
                                [-4.7882080e-02,  9.8162230e+00, -1.3407898e-01,  1.6937256e-03, -5.1879880e-04,  6.2561035e-04],
                                [-4.3090820e-02,  9.8210140e+00, -1.9154358e-01, -1.4953613e-03, -1.5869141e-03, -4.4250488e-04],
                                [-3.8314820e-02,  9.8162230e+00, -8.6196900e-02, -1.4953613e-03, -1.5869141e-03, -1.5106201e-03],
                                [-3.8314820e-02,  9.8210140e+00, -1.5322876e-01, -1.4953613e-03, -5.1879880e-04, -4.4250488e-04],
                                [-3.3523560e-02,  9.8162230e+00, -4.3090820e-02, -4.2724610e-04, -1.5869141e-03,  6.2561035e-04],
                                [-3.8314820e-02,  9.8210140e+00, -3.3523560e-02, -2.5634766e-03,  1.6174316e-03, -4.4250488e-04],
                                [-3.3523560e-02,  9.8210140e+00, -4.7912598e-03,  6.4086914e-04, -5.1879880e-04, -4.4250488e-04],
                                [-2.8732300e-02,  9.8258060e+00, -6.2255860e-02, -4.2724610e-04, 5.4931640e-04, -4.4250488e-04],
                                [-3.3523560e-02,  9.8258060e+00, -5.7464600e-02,  6.4086914e-04, 5.4931640e-04,  6.2561035e-04],
                                [-3.8314820e-02,  9.8210140e+00, -7.6614380e-02, -4.2724610e-04, 5.4931640e-04, -4.4250488e-04],
                                [-3.3523560e-02,  9.8258060e+00, -1.0534668e-01,  6.4086914e-04, -1.5869141e-03,  6.2561035e-04],
                                [-3.8314820e-02,  9.8210140e+00, -1.3887024e-01, -4.2724610e-04, 5.4931640e-04, -4.4250488e-04],
                                [-3.8314820e-02,  9.8210140e+00, -1.1492920e-01, -4.2724610e-04, 5.4931640e-04,  6.2561035e-04],
                                [-3.8314820e-02,  9.8210140e+00, -1.6758728e-01, -4.2724610e-04, -5.1879880e-04,  6.2561035e-04],
                                [-4.3090820e-02,  9.8210140e+00, -1.2449646e-01,  6.4086914e-04, -5.1879880e-04, -4.4250488e-04],
                                [-4.7882080e-02,  9.8258060e+00, -1.3887024e-01, -1.4953613e-03, -1.5869141e-03, -4.4250488e-04],
                                [-3.3523560e-02,  9.8258060e+00, -1.1013794e-01, -1.4953613e-03, -1.5869141e-03,  6.2561035e-04],
                                [-4.3090820e-02,  9.8210140e+00, -6.7031860e-02, -1.4953613e-03, -5.1879880e-04,  6.2561035e-04],
                                [-4.3090820e-02,  9.8210140e+00, -8.1405640e-02,  6.4086914e-04, -5.1879880e-04, -1.5106201e-03],
                                [-2.8732300e-02,  9.8258060e+00, -8.1405640e-02, -4.2724610e-04, 5.4931640e-04, -4.4250488e-04],
                                [-4.3090820e-02,  9.8210140e+00, -9.0972900e-02,  6.4086914e-04, 5.4931640e-04,  6.2561035e-04],
                                [-3.3523560e-02,  9.8210140e+00, -8.1405640e-02,  6.4086914e-04, -5.1879880e-04,  6.2561035e-04],
                                [-3.3523560e-02,  9.8305970e+00, -1.1492920e-01, -4.2724610e-04, -5.1879880e-04, -4.4250488e-04],
                                [-2.8732300e-02,  9.8162230e+00, -1.1492920e-01, -4.2724610e-04, 5.4931640e-04,  6.2561035e-04],
                                [-3.8314820e-02,  9.8258060e+00, -1.2449646e-01,  6.4086914e-04, 5.4931640e-04,  6.2561035e-04],
                                [-3.3523560e-02,  9.8162230e+00, -1.0534668e-01, -4.2724610e-04, 5.4931640e-04, -4.4250488e-04],
                                [-3.3523560e-02,  9.8210140e+00, -1.0055542e-01,  6.4086914e-04, -5.1879880e-04, -4.4250488e-04],
                                [-2.8732300e-02,  9.8162230e+00, -1.0055542e-01,  6.4086914e-04, 5.4931640e-04, -4.4250488e-04],
                                [-3.3523560e-02,  9.8114320e+00, -1.1013794e-01, -4.2724610e-04, 5.4931640e-04, -4.4250488e-04],
                                [-3.8314820e-02,  9.8210140e+00, -1.0534668e-01,  1.6937256e-03, -5.1879880e-04,  6.2561035e-04],
                                [-3.3523560e-02,  9.8258060e+00, -1.1492920e-01, -4.2724610e-04, -5.1879880e-04,  6.2561035e-04]]]
                                
            // const data = this.$store.state.data[0]?.dataPoint[3];
            // if(data != null){
            //     console.log(data.id);
            //     console.log(data);
            // }
            // else{
            //     const tensor = tf.tensor(instance);
            //     let a = model.predict(tensor);
            //     a.print();
            // }
            const tensor = tf.tensor(instance);
            let a = model.predict(tensor);
            a.print();
            this.$store.commit("modelLoaded", model);
        },
        onSubmit: function(e) {
            e.preventDefault();
            if (this.modelFileName.length > 0 && this.overlapping >= this.slidingWindow) {
                this.showInvalidFeedback = "Overlapping must be smaller than Sliding Window";
                return;
            }
            this.saveBtnText = "Saved!"
        },
        loadDataIntoModel: function() {
            const data = this.$store.state.data;
            if (this.modelFileName.length == 0) {
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
                    overlapping: this.overlapping,
                };
                this.$store.commit("loadDataIntoModel", modelConfiguration);
                this.modal.hide();
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
        // showInvalidInputFeedback: function() {
        //     if (this.modelFileName.length > 0 && this.overlapping != null && this.overlapping >= this.slidingWindow) {
        //         return "Overlapping must be smaller than Sliding Window";
        //     } else {
        //         return "";
        //     }
        // }
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
.styled-btn {
    background-color: #e1e1e5;
    font-size: 0.9rem;
}

#importedModelDiv {
    padding: 0;
    margin: auto;
    width: 50%;
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
</style>
