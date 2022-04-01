<template>
    <form class="form-container" @submit="onSubmit">
        <div class="row">
            <div class="col-auto text-start">
                <label for="validationLabelName" class="form-label description-text-sm">Label Name:</label>
                <input type="text" v-model="labelName" class="form-control" id="validationLabelName" required>
            </div>
        </div>
        <div class="row">
            <div class="col-auto text-start">
                <label for="validationLabelColor" class="form-label description-text-sm">Label Color:</label>
                <div class="row">
                    <div class="col col-10" id="colorInputContainer">
                        <input type="text" v-model="labelColor" class="form-control" id="validationLabelColor" required>
                    </div>
                    <div class="col col-2" id="submitButtonContainer">
                        <button class="btn btn-droplet" type="button" @click="showColorPicker = !showColorPicker">
                            <i class="fa-solid fa-droplet"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <ColorPicker @labelColorPicked="colorPicked" :colorForAxis="false" v-show="showColorPicker"/> 
            </div>
        </div>
        <div class="row" v-show="this.error != ''">
            <div id="allert-div" class="col-auto">
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
import ColorPicker from "./Colorpicker.vue"
import { db } from "/db"

export default {
    name: "AddLabel",
    components: { 
        ColorPicker,
    },
    props: {
        labelToEdit: Object,
    },
    data: function() {
        return {
            labelName: "",
            labelColor: "",
            showColorPicker: false,
            error: "",
        }
    },
    methods: {
        colorPicked: function(color) {
            this.labelColor = color
        },
        onSubmit: async function(e) {
            e.preventDefault();
            if (this.labelToEdit === null) {
                const currAnn = await db.lastSelected.where('id').equals(1).first();
                if (currAnn === undefined) { // no or false data uploaded --> no annotation file
                    this.error = "Can't add Label. First add Annotation file!"
                    return;
                }
                const label = {
                    name: this.labelName,
                    color: this.labelColor,
                }
                this.$emit("labelCreated", label)
            } else {
                let label = this.labelToEdit;
                label.name = this.labelName;
                label.color = this.labelColor;
                this.$emit("labelEdited", label)
            }
            this.labelName = "";
            this.labelColor = "";
            this.showColorPicker = false;
            this.error = "";
        },
    },
    watch: {
        labelToEdit: function() {
            if (this.labelToEdit !== null) {
                this.labelName = this.labelToEdit.name;
                this.labelColor = this.labelToEdit.color;
            } else {
                this.labelName = "";
                this.labelColor = "";
            }
        }
    },
    emits: ["closeModal", "labelCreated", "labelEdited"],
}

</script>

<style scoped>
.form-container {
    padding: 1rem;
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

.modal-footer {
    margin-top: 1.75rem;
}
</style>