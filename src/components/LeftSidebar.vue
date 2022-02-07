<template>
    <div class="row">
        <label class="description-text" >Data Files</label>
        <div class="input-group">
            <select v-model="lastSelectedData" class="form-select" @change="selectDataFile()">
                <option v-for="row in data" :key="row.id" v-bind:value="row.id">
                    {{ row.name }}
                </option>
            </select>
            <div class="input-group-apend">
                <input id="dataFileUpload" type="file" accept=".csv" multiple v-on:change="onDataFileChange" hidden>
                <button type="button" class="btn btn-default btn-circle" @click="chooseDataFile">
                    <i class="fa fa-plus"></i>
                </button>
            </div>
        </div>
    </div>
    <div class="row">
        <label class="description-text" >Y-Axes</label>
        <div id="scroll-container-axes">
            <div class="row axis-container" v-for="axis in this.axes" :key="axis.id" >
                <Axis :axis="axis" :isSelected="(selectedAxes.indexOf(axis.id) > -1)" />
                
            </div>
        </div>
    </div>
    <div class="row">
        <label class="description-text" >Annotation Files</label>
        <div class="input-group">
            <select v-model="lastSelectedAnnotation" class="form-select" ref="annoSelect" @change="selectAnnotationFile()">
                <option v-for="annotationFile in annotationFiles" :key="annotationFile.id" v-bind:value="annotationFile.id">
                    {{ annotationFile.name }}
                </option>
            </select>
            <div class="input-group-apend">
                <button type="button" class="btn btn-default btn-circle" @click="showAnnotationModal">
                    <i class="fa fa-plus"></i>
                </button>
            </div>
        </div>
    </div>
    <div class="row">
        <span class="description-text" >
            <label>Labels</label>
            <button type="button" class="btn btn-default btn-circle" @click="showLabelModal">
                <i class="fa fa-plus"></i>
            </button>
        </span>
        <div class="row justify-content-start align-items-center">
            <div class="col-auto area-visibility-container">
                <p class="area-p">Areas visible</p>
            </div>
            <div class="col-auto area-visibility-container ps-0">
                <label class="switch">
                    <input type="checkbox" v-show="false">
                    <span class="slider round"></span>
                </label>
            </div>
        </div>
        <div id="scroll-container-labels">
            <div class="row label-container" v-for="label in this.labels" :key="label.id" @click="labelOnClick(label)" >
                <Label :label="label" @editLabel="editLabel" />
            </div>
        </div>
    </div>
    <AnnotationModal :toggleModalVisibility="toggleAnnotationModalVisibility" />
    <LabelModal :addLabelKey="addLabelKey" :toggleModalVisibility="toggleLabelModalVisibility" :labelToEdit="labelToEdit" />
</template>

<script>
import Axis from "./Axis.vue"
import Label from "./Label.vue"
import AnnotationModal from "./AnnotationModal.vue"
import LabelModal from "./LabelModal.vue"
import { liveQuery } from "dexie";
import { db } from "/db";
import { useObservable } from "@vueuse/rxjs";

export default {
    name: "LeftSidebar",
    components: {
        Axis,
        Label,
        AnnotationModal,
        LabelModal,
    },
    setup: function(){
        const currAnn = useObservable(liveQuery(() => db.lastSelected.where('id').equals(1).first()));
        const labels = useObservable(liveQuery(async () => {
            const curr = await db.lastSelected.where('id').equals(1).first();
            return db.labels.where('annoId').equals(parseInt(curr?.annoId || 1)).toArray();
        }));
        const annotationFiles = useObservable(liveQuery(() => db.annotations.toArray()));
        return {
            labels,
            annotationFiles,
            currAnn,
        }
    },
    data() {
        return {
            lastSelectedData: this.$store.state.currentSelectedData,
            lastSelectedAnnotation: 1,
            toggleAnnotationModalVisibility: false,
            toggleLabelModalVisibility: false,
            labelToEdit: null,
            addLabelKey: 0,
            acceptedKeys: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
        }
    },
    computed: {
        data: function() {
            return this.$store.state.data;
        },
        axes: function() {
            return this.$store.getters.getAxes;
        },
        selectedAxes: function() {
            return this.$store.getters.selectedAxes;
        },
    },
    watch: {
        currAnn: function(){
            this.lastSelectedAnnotation = this.currAnn?.annoId;
        }
    },
    methods: {
        labelOnClick(label) {
            this.$store.commit("toggleActiveLabel", label);
        },
        editLabel(label) {
            this.labelToEdit = label;
            this.toggleLabelModalVisibility = !this.toggleLabelModalVisibility;
        },
        showAnnotationModal() {
            this.toggleAnnotationModalVisibility = !this.toggleAnnotationModalVisibility;
        },
        showLabelModal() {
            if (this.addLabelKey == 0) {
                this.addLabelKey = 1;
            } else {
                this.addLabelKey = 0;
            }
            this.labelToEdit = null;
            this.toggleLabelModalVisibility = !this.toggleLabelModalVisibility;
        },
        selectDataFile() {
            this.$store.commit("selectDataFile", this.lastSelectedData);
        },
        selectAnnotationFile() {
            db.lastSelected.update(1, {annoId: parseInt(this.$refs.annoSelect.value)});
        },
        chooseDataFile() {
            document.getElementById("dataFileUpload").click();
        },
        onDataFileChange(e) {
            const fileList = e.target.files;
            for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
                const file = fileList[i];
                this.readFile(file);
            }
        },
        readFile(file){
            const reader = new FileReader();
            if(file.name[0] != '.' && (file.type.includes("text") || file.type.includes("excel"))) {
                reader.readAsText(file);
                reader.onload = () => {
                    if(file.name.includes("data")){
                        this.$store.commit("addData", {result: reader.result, name: file.name});
                    }
                }
            }
        },
        keyPressed: function(e) {
            let key = e.key;
            if (this.acceptedKeys.indexOf(key) > -1) {
                if (key == 0) { // modify key so that by pressing 1 its the first label, which has index 0, and by pressing 0 you reach label 10
                    key = 10;
                } else {
                    key -= 1;
                }
                if (this.labels == undefined || this.labels == null) {
                    return;
                }
                const keys = Object.keys(this.labels);
                if (keys.length > 0 && keys.length > key) {
                    key = keys[key];
                    this.$store.state.activeLabel = this.labels[key];
                }
            }
        }
    },
    mounted: async function() {
        window.addEventListener("keypress", this.keyPressed);
    },
    beforeUnmount: function() {
        window.removeEventListener('keypress', this.keyPressed);
    },
}
</script>

<style scoped>
.axis-container {
    margin-left: 12px;
    padding: 12px;
    padding-left: 0px;
    border-bottom: 0.1vw solid rgb(128, 128, 128, 0.5);
    text-align: left;
    align-items: center;
}

#scroll-container-axes {
    padding: 0px;
    overflow-y: auto;
    scrollbar-width: none;
    max-height: 25vh;
}
#scroll-container-axes::-webkit-scrollbar {
    width: 0;
    height: 0;
}

.input-group {
    padding-right: 0;
}

.input-group-apend {
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.btn-circle {
    height: 2.5vw;
    width: 2.5vw;
    border-radius: 1.25vw;
    text-align: center;
    font-size: 1vw;
    background-color: #bbb;
    opacity: 0.7;
    margin-left: 1vw;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0px;
}

.btn-circle:hover { 
    opacity: 1;
}

.fa-plus {
    max-height: fit-content;
    max-width: fit-content;
    display:inline-block;
    text-align: center;
    vertical-align: bottom;
}

.label-container {
    margin-left: 12px;
    padding: 12px;
    padding-left: 0px;
    border-bottom: 0.1vw solid rgb(128, 128, 128, 0.5);
    text-align: left;
    align-items: center;
}

.label-container:hover {
    background-color: rgb(128, 128, 128, 0.1);
}

#scroll-container-labels {
    padding: 0px;
    overflow-y: auto;
    scrollbar-width: none;
    max-height: 30vh;
}
#scroll-container-labels::-webkit-scrollbar { 
    width: 0;
    height: 0;
}

</style>

<style>
.description-text {
    text-align: left;
    font-family: Tahoma;
    font-weight: Bold;
    font-size: 1.5vw;
    padding-top: 10px;
    padding-bottom: 2px;
    margin: 0;
}

.description-text-sm {
    text-align: left;
    font-family: Tahoma;
    font-size: 1vw;
    margin: 2px;
    color: gray;
}

.fa-edit , .fa-times{
    opacity: 0.5;
}

.fa-edit:hover, .fa-times:hover {
    opacity: 1;
    cursor: pointer;
}

.area-p {
    margin-bottom: 0;
}

.area-visibility-container {
    height: fit-content;
    display: inline-flex;
}

.switch {
  position: relative;
  display: inline-block;
  width: 3vw;
  height: 1.5vw;
  margin-top: auto;
  margin-bottom: auto;
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