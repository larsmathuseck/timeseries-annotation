<template>
    <div class="row">
        <div class="col-auto">
            <button @click="doStuff">Test Modell</button>
        </div>
        <div class="col-auto">
            <button @click="loadMobileNet">MobileNet</button>
        </div>
        <div class="col-auto">
            <label> {{ this.status }}</label>
        </div>
        <div class="col-auto" id="picID">
            <img width="100" height="100" src="img\electricGuitar.jpg" id="image" />
        </div>
    </div>
</template>

<script>
import ml5 from 'ml5';
import * as tf from '@tensorflow/tfjs';
//import testModel from "../../public/customModel/modelWithoutL2.json";
import {fetch as fetchPolyfill} from 'whatwg-fetch'

console.log('ml5 version:', ml5.version);

export default {
    name: "TestMl5",
    data() {
        return {
            status: "nothing done yet",
            customModelPath: "customModel/model.json",
            customModelWithoutL2Path: "customModel/modelWithoutL2.json",
            ml5ModelPath: "ml5Model/model.json",
            ml5MetaDataPath: "ml5Model/model_meta.json",
            ml5WeigthsPath: "ml5Model/model.weights.bin",
            modelJson: require("../../public/customModel/modelWithoutL2.json"),
            model: {},
            img: Object,
        };
    },
    methods: {
        /*doStuff: function() {
            this.status = "loading model...";
            this.img = document.getElementById('image'); // The image we want to classify
            this.classifier = ml5.imageClassifier('MobileNet', this.modelLoaded)
        },*/
        doStuff: async function() {
            // let testModelString = JSON.stringify(testModel);
            // localStorage.setItem('my-model', testModelString);
            // console.log(localStorage.getItem("my-model"));
            // const modelFromLocalStorage = localStorage.getItem('my-model');
            // const JSONSavedModel = JSON.parse(modelFromLocalStorage)
            window.fetch = fetchPolyfill;
            //const modelUrl = "../../public/customModel/modelWithoutL2.json"
            const model = await tf.loadLayersModel(this.customModelWithoutL2Path);
            //const model = await tf.loadLayersModel('localstorage://my-model');
            console.log(model);
        },
        /*doStuff: function () {
            this.status = "loading model...";
            const options = {
                task: 'classification',
            };
            this.model = ml5.neuralNetwork(options);
            this.modelLoaded();
        },*/
        modelLoaded: function() {
            console.log("Model Loaded!2");
            this.status = "neural Network loaded!";

            console.log(this.model);
            //this.model.save();
            /*const trainedModelDetails = {
                model: this.customModelPath,
                //metadata: this.ml5MetaDataPath,
                //weights: this.ml5WeigthsPath,
            }*/
            
            console.log("modelJson: ", this.modelJson);
            this.model.load(this.customModelPath, this.trainedModelLoaded);

            //this.classifier.classify(this.img, this.gotResults); 
            /*this.classifier.classify(this.img, (err, results) => {
                console.log(results[0].label);
                console.log(results[0].confidence.toFixed(4))
            });*/
        },
        trainedModelLoaded: function() {
            this.status = "trained model loaded!"
            console.log(this.model);
        },
        loadMobileNet: function() {
            this.img = document.getElementById('image');
            this.status = "start loading mobilenet";
            this.classifier = ml5.imageClassifier('MobileNet', this.mobileNetLoaded);
        },
        mobileNetLoaded: function() {
            this.status = "mobilenet loaded!"
            this.classifier.classify(this.img, this.gotResults); 
        },
        gotResults: function(error, results) {
            if (error) {
                console.log("error:")
                console.error(error);
            } else {
                this.status = results[0].label + " with confidence: " + results[0].confidence;
                console.log(results);
            }
        },
    },
};
</script>
