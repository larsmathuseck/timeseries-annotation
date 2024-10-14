<template>
    <div class="form-container">
        <div class="row mb-3 justify-content-center">
            <label for="selectedAxis" class="col-4 col-form-label">Axis</label>
            <div class="col-8">
                <select
                    id="selectedAxis"
                    ref="select"
                    v-model="selectedAxis"
                    :disabled="!!axisToEdit"
                    class="form-select"
                    required
                >
                    <option v-for="axis in axes" :key="axis.id" :value="axis">
                        {{ axis.name }}
                    </option>
                </select>
            </div>
        </div>
        <div class="row mb-3 justify-content-center">
            <label for="selectedFeature" class="col-4 col-form-label"
                >Method</label
            >
            <div class="col-8">
                <select
                    id="selectedFeature"
                    ref="select"
                    v-model="selectedFeature"
                    :disabled="!!axisToEdit"
                    class="form-select"
                    required
                >
                    <option
                        v-for="feature in features"
                        :key="feature.id"
                        :value="feature"
                    >
                        {{ feature.name }}
                    </option>
                </select>
            </div>
        </div>
        <div class="row mb-3 justify-content-center">
            <label for="samplingRate" class="col-4 col-form-label"
                >Samplingrate</label
            >
            <div class="col-8">
                <input
                    id="samplingRate"
                    v-model="samplingRate"
                    :disabled="!!axisToEdit"
                    type="number"
                    class="form-control"
                />
            </div>
        </div>
        <div class="row mb-3 justify-content-center">
            <div class="col-4">
                <label for="validationLabelColor" class="col-form-label"
                    >Axis Color:</label
                >
            </div>
            <div class="col-8">
                <div class="row">
                    <div id="colorInputContainer" class="col-10">
                        <input
                            id="validationLabelColor"
                            v-model="axisColor"
                            type="text"
                            class="form-control"
                            required
                        />
                    </div>
                    <div id="submitButtonContainer" class="col-2">
                        <button
                            class="btn btn-droplet"
                            type="button"
                            @click="showColorPicker = !showColorPicker"
                        >
                            <i class="fa-solid fa-droplet"></i>
                        </button>
                    </div>
                    <div class="col-12">
                        <TfaColorPicker
                            v-show="showColorPicker"
                            :color-for-axis="false"
                            @labelColorPicked="colorPicked"
                        />
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <label for="axisNameInput" class="col-4 col-form-label"
                >Axis Name</label
            >
            <div class="col-8">
                <input
                    id="axisNameInput"
                    v-model="axisName"
                    type="text"
                    class="form-control"
                    required
                />
            </div>
        </div>
        <div v-show="error?.length" class="row">
            <div id="allert-div" class="col-lg-12">
                <div class="alert alert-danger" role="alert">
                    {{ error }}
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button
                v-if="axisToEdit"
                type="button"
                class="btn btn-danger"
                @click="deleteAxis"
            >
                Delete
            </button>
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
import FEATURES, { type Feature } from '../../../util/model/statistics'

export interface Props {
    axisToEdit: {
        color: string
        feature: Feature
        id: number
        name: string
        samplingRate?: number
    }
}
const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
    closeModal: []
    reloadGraph: []
}>()

const store = useTfAnnotatorStore()

// data
const selectedAxis = ref<{
    id: number
    name: string
}>()
const features = ref<Feature[]>()
const selectedFeature = ref<Feature | undefined>(FEATURES[0])
const axisColor = ref('blue')
const samplingRate = ref<number | undefined>(32)
const showColorPicker = ref(false)
const axisName = ref<string>()
const error = ref<string>()

// computations
const axes = computed(() => {
    if (props.axisToEdit) {
        return store.axesSelected
    } else {
        return Object.fromEntries(
            Object.entries(store.axesSelected).filter(
                (key) => !key[1].samplingRate,
            ),
        )
    }
})

// methods
const colorPicked = (color: string) => {
    axisColor.value = color
    showColorPicker.value = false
}
const onSubmit = (e: Event) => {
    e.preventDefault()
    if (!validateInputs()) {
        return
    }
    if (props.axisToEdit && axisName.value) {
        store.updateAxis({
            id: props.axisToEdit.id,
            name: axisName.value,
            color: axisColor.value,
        })
    } else if (
        axisName.value &&
        selectedAxis.value &&
        selectedFeature.value &&
        samplingRate.value
    ) {
        store.addAxis({
            name: axisName.value,
            axis: selectedAxis.value,
            color: axisColor.value,
            feature: selectedFeature.value,
            samplingRate: samplingRate.value,
        })
    }
    emit('closeModal')
    emit('reloadGraph')
}
const updateAxisName = () => {
    if (
        !props.axisToEdit &&
        samplingRate.value &&
        selectedFeature.value &&
        selectedAxis.value
    ) {
        axisName.value =
            selectedAxis.value.name +
            '-' +
            selectedFeature.value.shortName +
            '-' +
            samplingRate.value
    }
}
const deleteAxis = () => {
    if (Object.values(store.axesSelected).length === 1) {
        alert('At least 1 axis must be selected!')
        return
    }
    store.removeAxis(props.axisToEdit)
    emit('closeModal')
}
const validateInputs = () => {
    if (!samplingRate.value || isNaN(samplingRate.value)) {
        error.value = 'Samplingrate must be a number!'
        return false
    } else if (samplingRate.value < 0) {
        error.value = 'Samplingrate can not be a negative Number!'
        return false
    }
    return true
}

// lifecycle
watch(
    () => props.axisToEdit,
    (axisToEdit) => {
        if (axisToEdit) {
            if (!axisToEdit.samplingRate) {
                samplingRate.value = undefined
                selectedFeature.value = undefined
                features.value = undefined
            } else {
                samplingRate.value = axisToEdit.samplingRate
                selectedFeature.value = axisToEdit.feature
            }
            selectedAxis.value = axisToEdit
            axisColor.value = axisToEdit.color
            axisName.value = axisToEdit.name
        } else {
            selectedAxis.value = axes.value[0]
            features.value = FEATURES
            selectedFeature.value = FEATURES[0]
            axisColor.value = 'blue'
            samplingRate.value = 32
        }
    },
)
watch(axes, (axes) => {
    if (axes !== undefined && Object.entries(axes).length !== 0) {
        selectedAxis.value = axes[0]
        updateAxisName()
    }
})
watch(selectedFeature, () => updateAxisName())
watch(selectedAxis, () => updateAxisName())
watch(samplingRate, () => updateAxisName())
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
