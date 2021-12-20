<template>
    <div class="row">
        <p @click="test" class="description-text" >Data Files</p>
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
        <p class="description-text" >Y-Axes</p>
        <div id="scroll-container-axes">
            <div class="row axis-container" v-for="axis in this.axes" :key="axis.id" >
                <Axis :axis="axis" :isSelected="(selectedAxes.indexOf(axis.id) > -1)" />
                <div class="colorpicker-container">
                    <ColorPicker v-show="showColorPicker" />
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <p class="description-text" >Annotation Files</p>
        <div class="input-group">
            <select v-model="lastSelectedAnnotation" class="form-select" @change="selectAnnotationFile()">
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
        <div id="scroll-container-labels">
            <div class="row label-container" v-for="label in this.labels" :key="label.id" @click="labelOnClick(label)" >
                <Label :label="label" @editLabel="editLabel" />
            </div>
        </div>
    </div>
    <AnnotationModal :annotationModalKey="annotationModalKey" :toggleModalVisibility="toggleAnnotationModalVisibility" />
    <LabelModal :addLabelKey="addLabelKey" :toggleModalVisibility="toggleLabelModalVisibility" :labelToEdit="labelToEdit" />
</template>

<script>
import Axis from "./Axis.vue"
import ColorPicker from "./Colorpicker.vue"
import Label from "./Label.vue"
import AnnotationModal from "./AnnotationModal.vue"
import LabelModal from "./LabelModal.vue"


export default {
    name: "LeftSidebar",
    components: {
        Axis,
        ColorPicker,
        Label,
        AnnotationModal,
        LabelModal,
    },
    data() {
        return {
            lastSelectedData: this.$store.state.currentSelectedData,
            lastSelectedAnnotation: this.$store.state.currAnn,
            showColorPicker: false,
            toggleAnnotationModalVisibility: false,
            toggleLabelModalVisibility: false,
            labelToEdit: null,
            annotationModalKey: 2,
            addLabelKey: 0,
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
        labels: function() {
            return this.$store.getters.getLabels;
        },
        annotationFiles: function() {
            return this.$store.state.annotations;
        },
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
            if (this.annotationModalKey == 2) {
                this.annotationModalKey = 3;
            } else {
                this.annotationModalKey = 2;
            }
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
            this.$store.commit("selectAnnotationFile", this.lastSelectedAnnotation);
        },
        chooseDataFile() {
            document.getElementById("dataFileUpload").click()
        },
        onDataFileChange(e) {
            const fileList = e.target.files;
            for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
                const reader = new FileReader();
                const file = fileList[i];
                if(file.name[0] != '.' && (file.type.includes("text") || file.type.includes("excel"))) {
                    reader.readAsText(file);
                    reader.onload = () => {
                        if(file.name.includes("data")){
                            this.$store.commit("addData", {result: reader.result, name: file.name});
                        }
                    }
                }
            }
        },
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

.colorpicker-container {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    width: 100%;
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

</style>