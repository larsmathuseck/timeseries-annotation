<template>
    <form class="form-container" @submit="onSubmit">
        <div class="row mb-3 justify-content-center">
            <label for="selectedAxis" class="col-4 col-form-label">Axis</label>
            <div class="col-4 col-lg-8">
                <select :disabled="axisToEdit != null" v-model="selectedAxis" id="selectedAxis" ref="select" class="form-select" required>
                    <option v-for="axis in axes" :key="axis.id" v-bind:value="axis" >
                        {{ axis.name }}
                    </option>
                </select>
            </div>
        </div>
        <div class="row mb-3 justify-content-center">
            <label for="selectedFeature" class="col-4 col-form-label">Method</label>
            <div class="col-4 col-lg-8">
                <select :disabled="axisToEdit != null" v-model="selectedFeature" id="selectedFeature" ref="select" class="form-select" required>
                    <option v-for="feature in features" :key="feature.id" v-bind:value="feature" >
                        {{ feature.name }}
                    </option>
                </select>
            </div>
        </div>
        <div class="row mb-3 justify-content-center">
            <label for="samplingRate" class="col-4 col-form-label">Samplingrate</label>
            <div class="col-lg-8">
                <input :disabled="axisToEdit != null" v-model="samplingRate" type="number" class="form-control" id="samplingRate">
            </div>
        </div>
        <div class="row mb-3 justify-content-center">
            <div class="col-4">
                <label for="validationLabelColor" class="col-form-label">Axis Color:</label>
            </div>
            <div class="col-lg-8">
                <div class="row">
                    <div class="col-10" id="colorInputContainer">
                        <input type="text" v-model="axisColor" class="form-control" id="validationLabelColor" required>
                    </div>
                    <div class="col-2" id="submitButtonContainer">
                        <button id="colorButton" class="btn rounded" type="button" @click="showColorPicker = !showColorPicker">
                            <i class="fa-solid fa-droplet"></i>
                        </button>
                    </div>
                    <div class="col-12">
                        <ColorPicker @labelColorPicked="colorPicked" :colorForAxis="false" v-show="showColorPicker"/> 
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <label for="axisNameInput" class="col-4 col-form-label">Axis Name</label>
            <div class="col-lg-8">
                <input v-model="axisName" type="text" class="form-control" id="axisNameInput" required>
            </div>
        </div>
        <div class="row" v-show="this.error != ''">
            <div id="allert-div" class="col-lg-12">
                <div class="alert alert-danger" role="alert">
                    {{ this.error }}
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-danger" v-if="axisToEdit" @click="deleteAxis">Delete</button>
            <button type="button" class="btn btn-secondary" @click="$emit('closeModal')">Close</button>
            <button id="submitButton" class="btn btn-primary" type="submit">Save</button>
        </div>
    </form>
</template>

<script>
import ColorPicker from "./Colorpicker.vue";
import features from "../util/model/ModelFunctions";

export default {
    name: "AddAxis",
    components: { 
        ColorPicker,
    },
    data() {
        return {
            selectedAxis: {},
            features: features,
            selectedFeature: features[0],
            axisColor: "blue",
            samplingRate: 32,
            showColorPicker: false,
            axisName: '',
            error: "",
        }
    },
    props: {
        axisToEdit: Object,
    },
    computed: {
        axes() {
            return this.$store.getters.getAxes;
        },
    },
    methods: {
        colorPicked(color) {
            this.axisColor = color;
            this.showColorPicker = false;
        },
        onSubmit(e) {
            e.preventDefault();
            if (!this.validateInputs()) {
                return;
            }
            if(this.axisToEdit != null) {
                this.$store.commit("updateAxis", {id: this.axisToEdit.id, name: this.axisName, color: this.axisColor});
            }
            else {
                this.$store.commit("addAxis", {name: this.axisName, axis: this.selectedAxis, color: this.axisColor, feature: this.selectedFeature, samplingRate: this.samplingRate});
            }
            this.$emit('closeModal');
        },
        updateAxisName() {
            if(this.axisToEdit == null && this.samplingRate && this.selectedFeature){
                this.axisName = this.selectedAxis.name + "-" + this.selectedFeature.shortName + "-" + this.samplingRate;
            }
        },
        deleteAxis() {
            this.$store.commit("deleteAxis", this.axisToEdit);
            this.$emit('closeModal');
        },
        validateInputs() {
            if (isNaN(this.samplingRate)) {
                this.error = "Samplingrate must be a number!";
                return false;
            }
            else if (parseInt(this.samplingRate) < 0) {
                this.error = "Samplingrate can not be a negative Number!";
                return false;
            }
            return true;
        }
    },
    watch: {
        axisToEdit() {
            if(this.axisToEdit != null) {
                if(this.axisToEdit.samplingRate == null) {
                    this.samplingRate = null;
                    this.selectedFeature = null;
                    this.features = null;
                }
                else {
                    this.samplingRate = this.axisToEdit.samplingRate;
                    this.selectedFeature = this.axisToEdit.feature;
                }
                this.selectedAxis = this.axisToEdit;
                this.axisColor = this.axisToEdit.color;
                this.axisName = this.axisToEdit.name;
            }
            else {
                this.selectedAxis = this.axes[0];
                this.features = features;
                this.selectedFeature = features[0];
                this.axisColor = "blue";
                this.samplingRate =  32;
            }
        },
        axes() {
            if (this.axes != undefined && this.axes.length != 0) {
                this.selectedAxis = this.axes[0];
                this.updateAxisName();
            }
        },
        selectedFeature() {
            this.updateAxisName();
        },
        selectedAxis() {
            this.updateAxisName();
        },
        samplingRate() {
            this.updateAxisName();
        },
    },
}

</script>

<style scoped>
.form-container {
    padding: 1rem;
}

#colorButton {
    align-self: center;
    background-color: #2196F3;
    opacity: 0.7;
}

#colorButton:hover { 
    opacity: 1;
}

#colorInputContainer {
    padding-right: 0px;
}

#submitButtonContainer {
    padding-left: 0px;
}

.alert-danger {
    margin-top: 1.5rem;
    margin-bottom: 0px;
}

.fa-droplet {
    height: 0.75rem;
    width: 0.75rem;
    color: white;
    opacity: 1;
}

.colorpicker-container {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    width: 100%;
}

.modal-footer {
    margin-top: 1.75rem;
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
</style>