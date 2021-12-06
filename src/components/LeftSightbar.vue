<template>
    <div class="row">
        <label @click="test" class="description-text" >Add Y-Axis</label>
        <label class="description-text-sm">Add Y-axis to show</label>
        <div class="select" >
            <select v-model="lastSelectedAxis" class="form-select" @click="addSelectedAxis($event)">
                <option v-for="axis in axes" :key="axis.id" v-bind:value="axis">
                    {{ axis.name }}
                </option>
            </select>
            <div class="colorpicker-container">
                <ColorPicker :colorForAxis="true" @axis-color-picked="setSelectedAxisColor" v-show="showColorPicker"/>
            </div>
        </div>
    </div>
    <div class="row">
        <label class="description-text" >Selected Axis</label>
        <div class="row selectedAxis-row">
            <div class="col-auto" v-for="selectedAxis in this.selectedAxes" :key="selectedAxis.name" >
                <SelectedAxis :selectedAxis="selectedAxis" />
            </div>
        </div>
    </div>
    <div class="row">
        <label class="description-text" >Annotation Files</label>
        <label class="description-text-sm">Select file to annotate Chart</label>
        <div class="selec" >
            <select class="form-select">
                <option v-for="annotationFile in annotationFiles" :key="annotationFile.id" >
                    {{ annotationFile.name }}
                </option>
            </select>
        </div>
    </div>
    <div class="row">
        <span class="description-text" >
            <label>Labels</label>
            <button type="button" class="btn btn-default btn-circle" @click="showModal">
                <i class="fa fa-plus"></i>
            </button>
        </span>
        <label class="description-text-sm">Select Labels to annotate Chart</label>
        <div class="label-container" v-for="label in this.labels" :key="label.id" @click="labelOnClick(label)" >
            <Label :label="label" />
        </div>
    </div>
    <LabelModal :toggleModalVisibility="toggleModalVisibility" @closeModal="closeModal" />
</template>

<script>
import SelectedAxis from "./SelectedAxis.vue"
import ColorPicker from "./Colorpicker.vue"
import Label from "./Label.vue"
import LabelModal from "./LabelModal.vue"


export default {
    name: "LeftSightbar",
    components: {
        SelectedAxis,
        ColorPicker,
        Label,
        LabelModal,
    },
    props: {
        annotationFiles: Array,
    },
    data() {
        return {
            lastSelectedAxis: Object,
            showColorPicker: false,
            showAddLabel: false,
            toggleModalVisibility: false,
        }
    },
    computed: {
        axes: function() {
            return this.$store.state.data;
        },
        selectedAxes: function() {
            let selectedIds = this.$store.state.selectedAxes;
            let selected = [];
            this.axes.forEach(axis => {
                if(selectedIds.includes(axis.id)){
                    selected.push(axis);
                }
            });
            return selected;
        },
        labels: function() {
            return this.$store.state.labels;
        }
    },
    methods: {
        addSelectedAxis(event) {
            if (event.target.value !== "" ) {
                this.showColorPicker = true;
            }
        },
        setSelectedAxisColor(color) {
            this.lastSelectedAxis.color = color
            this.$store.commit("addSelectedAxes", this.lastSelectedAxis);
            this.showColorPicker = false;
        },
        labelOnClick(label) {
            this.$store.commit("toggleActiveLabel", label);
        },
        showModal() {
            this.toggleModalVisibility = !this.toggleModalVisibility;
        },
        closeModal() {
            console.log("close modal")
            this.modalVisible = false;
        },
    },
    emits: ["delete-selected-axis", "axis-color-picked", "toggle-active-label", "labelCreated"],
}
</script>

<style scoped>
.selectedAxis-row {
    margin-left: 12px;
    padding-left: 0px;
}

.colorpicker-container {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    width: 100%;
}

.col-auto {
    padding-left: 2.5px;
    padding-right: 2.5px;
}

div.absolute {
    position: absolute;
}

.btn-circle {
    height: 45px;
    width: 45px;
    padding: 6px 0px;
    border-radius: 22.5px;
    text-align: center;
    font-size: 20px;
    line-height: 1.42857;
    background-color: #bbb;
    opacity: 0.7;
    margin-left: 15px;
}

.btn-circle:hover { 
    opacity: 1;
}

.label-container {
    margin-left: 12px;
    padding: 12px;
    padding-left: 0px;
    border-bottom: 1.5px solid rgb(128, 128, 128, 0.5);
}

.label-container:hover {
    background-color: rgb(128, 128, 128, 0.1);
}

</style>

<style>
.description-text {
    text-align: left;
    font-family: Tahoma;
    font-weight: Bold;
    font-size: 1.5rem;
    margin: 2px;
}

.description-text-sm {
    text-align: left;
    font-family: Tahoma;
    font-size: 1rem;
    margin: 2px;
    color: gray;
}

.fa-times {
    opacity: 0.5;
}

.fa-times:hover {
    opacity: 1;
    cursor: pointer;
}
</style>