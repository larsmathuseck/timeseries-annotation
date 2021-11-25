<template>
    <div class="row">
        <p @click="test" class="description-text" >Add Y-Axis</p>
        <p class="description-text-sm">Add Y-axis to show</p>
        <div class="selec" >
            <select v-model="selected" class="form-select" @change="addSelectedAxis($event)">
                <option v-for="axis in axes" :key="axis.name" v-bind:value="axis">
                    {{ axis.name }}
                </option>
            </select>
            <div class="row absolute" v-if="showColorPicker">
                <ColorPicker :colors="colors" @axis-color-picked="setSelectedAxisColor" />
            </div>
        </div>
    </div>
    <div class="row">
        <p class="description-text" >Selected Axis</p>
        <div class="col-auto" v-for="selectedAxis in this.selectedAxes" :key="selectedAxis.name" >
            <SelectedAxis :selectedAxis="selectedAxis" @delete-selected-axis="$emit('delete-selected-axis', selectedAxis)" />
        </div>
    </div>
    <div class="row">
        <p class="description-text" >Annotation Files</p>
        <p class="description-text-sm">Select file to annotate chart</p>
        <div class="selec" >
            <select class="form-select" v-model="selected">
                <option v-for="annotationFile in annotationFiles" :key="annotationFile.id" >
                    {{ annotationFile.name }}
                </option>
            </select>
        </div>
    </div>
    <div class="row">
        <span class="description-text" >
            Labels
            <button type="button" class="btn btn-default btn-circle">
                <i class="fa fa-plus"></i>
            </button>
        </span>
        <div class="label-container" v-for="label in this.labels" :key="label.id" @click="labelOnClick(label)" >
            <Label :label="label" :activeLabel="activeLabel"/>
        </div>
    </div>
</template>

<script>
import SelectedAxis from "./SelectedAxis.vue"
import ColorPicker from "./Colorpicker.vue"
import Label from "./Label.vue"

export default {
    name: "LeftSightbar",
    components: {
        SelectedAxis,
        ColorPicker,
        Label,
    },
    props: {
        axes: Array,
        annotationFiles: Array,
        selectedAxes: Array,
        labels: Array,
        activeLabel: Object,
        colors: Array,
    },
    data() {
        return {
            lastSelectedAxis: Object,
            showColorPicker: false,
            selected: Object,
        }
    },
    methods: {
        addSelectedAxis() {
            console.log(this.selected)
            this.lastSelectedAxis = {
                id: this.selectedAxes.length + 1,
                name: this.selected.name,
                color: "",
            }
            this.showColorPicker = true;
        },
        setSelectedAxisColor(color) {
            this.lastSelectedAxis.color = color
            this.$emit("add-selected-axis", this.lastSelectedAxis)
            this.showColorPicker = false;
        },
        labelOnClick(label) {
            this.$emit("toggle-active-label", label);
        }
    },
    emits: ["add-selected-axis", "delete-selected-axis", "axis-color-picked", "toggle-active-label"],
}
</script>

<style scoped>
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
</style>