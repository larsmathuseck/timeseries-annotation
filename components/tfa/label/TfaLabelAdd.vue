<template>
    <div class="form-container">
        <div class="row">
            <div class="col-auto text-start">
                <label
                    for="validationLabelName"
                    class="form-label description-text-sm"
                    >Label Name:</label
                >
                <input
                    id="validationLabelName"
                    v-model="labelName"
                    type="text"
                    class="form-control"
                    required
                />
            </div>
        </div>
        <div class="row">
            <div class="col-auto text-start">
                <label
                    for="validationLabelColor"
                    class="form-label description-text-sm"
                    >Label Color:</label
                >
                <div class="row">
                    <div id="colorInputContainer" class="col col-10">
                        <input
                            id="validationLabelColor"
                            v-model="labelColor"
                            type="text"
                            class="form-control"
                            required
                        />
                    </div>
                    <div id="submitButtonContainer" class="col col-2">
                        <button
                            class="btn btn-droplet"
                            type="button"
                            @click="showColorPicker = !showColorPicker"
                        >
                            <i class="fa-solid fa-droplet"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <TfaColorPicker
                    v-show="showColorPicker"
                    :color-for-axis="false"
                    @labelColorPicked="colorPicked"
                />
            </div>
        </div>
        <div v-show="error != ''" class="row">
            <div id="allert-div" class="col-auto">
                <div class="alert alert-danger" role="alert">
                    {{ error }}
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button
                type="button"
                class="btn btn-secondary"
                @click="$emit('closeModal')"
            >
                Close
            </button>
            <button
                id="submitButton"
                class="btn btn-primary"
                type="submit"
                @click="onSubmit"
            >
                Save
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { db } from '../../../db'

interface Props {
    labelToEdit?: {
        color: string
        id: number
        name: string
    }
}
const props = withDefaults(defineProps<Props>(), {
    labelToEdit: undefined,
})

const emit = defineEmits<{
    closeModal: []
    labelCreated: [
        label: {
            color: string
            name: string
        },
    ]
    labelEdited: [
        label: {
            color: string
            id: number
            name: string
        },
    ]
}>()

// data
const labelName = ref<string>()
const labelColor = ref<string>()
const showColorPicker = ref(false)
const error = ref<string>()

// methods
const colorPicked = (color: string) => {
    labelColor.value = color
}
const onSubmit = async (e: Event) => {
    e.preventDefault()

    if (!props.labelToEdit) {
        const lastSelected = await db.lastSelected.where('id').equals(1).first()

        if (!lastSelected) return

        const currentAnnotation = await db.annotations
            .where('id')
            .equals(lastSelected.annotationId)
            .first()

        if (!currentAnnotation) {
            // no or false data uploaded --> no annotation file
            error.value = "Can't add Label. First add Annotation file!"
            return
        }

        if (!labelColor.value || !labelName.value) return

        const label = {
            color: labelColor.value,
            name: labelName.value,
        }
        emit('labelCreated', label)
    } else {
        const label = {
            color: labelColor.value || props.labelToEdit.color,
            id: props.labelToEdit.id,
            name: labelName.value || props.labelToEdit.name,
        }
        emit('labelEdited', label)
    }

    labelName.value = undefined
    labelColor.value = undefined
    showColorPicker.value = false
    error.value = undefined
}

// lifecycle
watch(
    () => props.labelToEdit,
    (labelToEdit) => {
        if (labelToEdit) {
            labelName.value = labelToEdit.name
            labelColor.value = labelToEdit.color
        } else {
            labelName.value = undefined
            labelColor.value = undefined
        }
    },
)
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
