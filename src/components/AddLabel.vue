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
                <div class="input-group">
                    <input type="text" v-model="labelColor" class="form-control" id="validationLabelColor" required>
                    <div class="input-group-append">
                        <button id="colorButton" class="btn rounded" type="button" @click="showColorPicker = !showColorPicker">
                            <i class="fa fa-tint" />
                        </button>
                    </div>
                    <ColorPicker @labelColorPicked="colorPicked" :colorForAxis="false" v-show="showColorPicker"/>
                </div>
            </div>
        </div>
        <div id="buttonRow" class="row">
            <div class="col text-center">
                <button id="submitButton" class="btn btn-primary" type="submit">Add Label</button>
            </div>
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
            const label = {
                id: this.$store.state.labels.length + 1,
                name: this.labelName,
                color: this.labelColor,
            }
            this.$emit("labelCreated", label)
            this.labelName = ""
            this.labelColor = ""
        },
    }
}
</script>

<style scoped>

.form-container {
    padding: 10px;
    margin: 12px;
    border: 1.5px solid rgb(128, 128, 128, 0.5);
    border-radius: 30px;
}

#buttonRow {
    margin-top: 5px;
}

#colorButton {
    margin-left: 1,5px;
    align-self: center;
    background-color: rgb(8, 173, 173);
    opacity: 0.7;
}

#colorButton:hover { 
    opacity: 1;
}


.fa {
    height: 10px;
    width: 10px;
    color: white;
}
</style>