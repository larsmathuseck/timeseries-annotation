<template>
    <form class="form-container" @submit="onSubmit">
        <div class="row mb-3 justify-content-center">
            <label for="selectedAxis" class="col-4 col-form-label">Axis</label>
            <div class="col-4 col-lg-8">
                <select v-model="selectedAxis" id="selectedAxis" ref="select" class="form-select" required>
                    <option v-for="axis in axes" :key="axis.id" v-bind:value="{name: axis.name, id: axis.id}" >
                        {{ axis.name }}
                    </option>
                </select>
            </div>
        </div>
        <div class="row mb-3 justify-content-center">
            <label for="selectedFeature" class="col-4 col-form-label">Method</label>
            <div class="col-4 col-lg-8">
                <select v-model="selectedFeature" id="selectedFeature" ref="select" class="form-select" required>
                    <option v-for="feature in features" :key="feature.id" v-bind:value="feature" >
                        {{ feature.name }}
                    </option>
                </select>
            </div>
        </div>
        <div class="row mb-3 justify-content-center">
            <label for="samplingRate" class="col-4 col-form-label">Samplingrate</label>
            <div class="col-lg-8">
                <input v-model="samplingRate" type="number" class="form-control" id="samplingRate" required>
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
    computed: {
        axes: function() {
            return this.$store.getters.getAxes;
        },
    },
    methods: {
        colorPicked(color) {
            this.axisColor = color;
            this.showColorPicker = false;
        },
        onSubmit: function(e) {
            e.preventDefault();
            if (!this.validateInputs()) {
                return;
            }
            this.$store.commit("addAxis", {name: this.axisName, axis: this.selectedAxis, color: this.axisColor, feature: this.selectedFeature, samplingRate: this.samplingRate});
            this.$emit('closeModal');
        },
        validateInputs: function() {
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
        axes: function() {
            if (this.axes != undefined && this.axes.length != 0) {
                const temp = {
                    name: this.axes[0].name, 
                    id: this.axes[0].id
                }
                this.selectedAxis = temp;
                this.axisName = this.selectedAxis.name + "-" + this.selectedFeature.shortName;
            }
        },
        selectedFeature: function(){
            this.axisName = this.selectedAxis.name + "-" + this.selectedFeature.shortName;
        },
        selectedAxis: function(){
            this.axisName = this.selectedAxis.name + "-" + this.selectedFeature.shortName;
        }
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