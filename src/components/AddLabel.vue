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
                    <div class="col-auto" id="colorInputContainer">
                        <input type="text" v-model="labelColor" class="form-control" id="validationLabelColor" required>
                    </div>
                    <div class="col-auto" id="submitButtonContainer">
                        <button id="colorButton" class="btn rounded" type="button" @click="showColorPicker = !showColorPicker">
                            <i class="fa fa-tint" />
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
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('closeModal')">Close</button>
            <button id="submitButton" class="btn btn-primary" type="submit">Save</button>
        </div>
    </form>
</template>

<script>
import ColorPicker from "./Colorpicker.vue"

export default {
    name: "AddLabel",
    components: { 
        ColorPicker,
    },
    props: {
        labelToEdit: Object,
    },
    data() {
        return {
            labelName: "",
            labelColor: "",
            showColorPicker: false,
        }
    },
    methods: {
        colorPicked(color) {
            this.labelColor = color
        },
        onSubmit(e) {
            e.preventDefault()
            if (this.labelToEdit === null) {
                const labels = this.$store.getters.getLabels;
                const labelKeys = Object.keys(labels);
                const lastKey = labelKeys.at(-1);
                const lastLabel = labels[lastKey];
                let newId = 0
                if (Object.values(labels).length != 0) {
                    newId = lastLabel.id +1;
                }
                const label = {
                    id: newId,
                    name: this.labelName,
                    color: this.labelColor,
                }
                this.$emit("labelCreated", label)
            } else {
                const label = {
                    id: this.labelToEdit.id,
                    name: this.labelName,
                    color: this.labelColor,
                }
                this.$emit("labelEdited", label)
            }
            this.labelName = ""
            this.labelColor = ""
            this.showColorPicker = false;
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
    padding: 16px;
}

#buttonRow {
    margin-top: 5px;
}

#colorButton {
    margin-left: 1,5px;
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


.fa {
    height: 10px;
    width: 10px;
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
    margin-top: 25px;
}
</style>