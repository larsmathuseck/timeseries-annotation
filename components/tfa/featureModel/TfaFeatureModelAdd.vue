<template>
    <div class="container-fluid pt-0 px-0">
        <div>
            <div class="row mb-3 justify-content-center">
                <div class="col-2"></div>
                <label for="selectedAxis" class="col-4 col-form-label"
                    >Axis</label
                >
                <div class="col-4 col-lg-5">
                    <select
                        id="selectedAxis"
                        ref="select"
                        v-model="selectedAxis"
                        class="form-select"
                        required
                    >
                        <option
                            v-for="axis in store.axesSelected"
                            :key="axis.id"
                            :value="{ name: axis.name, id: axis.id }"
                        >
                            {{ axis.name }}
                        </option>
                    </select>
                </div>
                <div class="col-2 col-lg-1"></div>
            </div>
            <div class="row mb-3 justify-content-center">
                <div class="col-2"></div>
                <label for="selectedFeature" class="col-4 col-form-label"
                    >Feature</label
                >
                <div class="col-4 col-lg-5">
                    <select
                        id="selectedFeature"
                        ref="select"
                        v-model="selectedFeature"
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
                <div class="col-2 col-lg-1"></div>
            </div>
            <div class="row mb-3 justify-content-center">
                <div class="col-2"></div>
                <label for="slidingWindowInput" class="col-4 col-form-label"
                    >Sliding Window</label
                >
                <div class="col-2">
                    <input
                        id="slidingWindowInput"
                        v-model="slidingWindow"
                        type="text"
                        class="form-control"
                        placeholder="4"
                        required
                    />
                </div>
                <label class="col-2 col-lg-3 col-form-label text-start"
                    >Seconds</label
                >
                <div class="col-2 col-lg-1"></div>
            </div>
            <div class="row mb-3 justify-content-center">
                <div class="col-auto">
                    <button
                        type="submit"
                        class="btn btn-primary"
                        @click="onSubmit"
                    >
                        Add <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import features, { type Feature } from '../../../util/model/statistics'

const emit = defineEmits<{
    addFeature: [
        featureConfiguration: {
            id: unknown
            feature: Feature
            slidingWindow: string
            axis: { id: unknown }
        },
    ]
    setInvalidFeedback: [invalidFeedback: string]
}>()

const store = useTfAnnotatorStore()

// data
const counter = ref(0)
// const features = ref()
const selectedFeature = ref(features[0])
const slidingWindow = ref()
const selectedAxis = ref()

// computed
// const axes = computed(() => {
//     return store.axesSelected
// })

// methods
const onSubmit = (e: Event) => {
    e.preventDefault()
    if (!validateInputs()) {
        return
    }
    const feature: Feature = {
        func: selectedFeature.value.func,
        id: selectedFeature.value.id,
        name: selectedFeature.value.name,
        shortName: selectedFeature.value.shortName,
    }
    const featureConfiguration = {
        id: counter.value,
        feature,
        slidingWindow: slidingWindow.value,
        axis: selectedAxis.value,
    }
    counter.value++
    emit('addFeature', featureConfiguration)
}
const validateInputs = () => {
    let invalidFeedback = ''
    if (isNaN(slidingWindow.value)) {
        invalidFeedback = 'Sliding Window must be a number!'
    } else if (slidingWindow.value < 0) {
        invalidFeedback = 'Sliding Window can not be a negative Number!'
    }
    if (invalidFeedback.length === 0) {
        return true
    } else {
        emit('setInvalidFeedback', invalidFeedback)
        return false
    }
}

// lifecycle
watch(
    () => store.axesSelected,
    (axesSelected) => {
        if (axesSelected[0]) {
            const temp = {
                name: axesSelected[0].name,
                id: axesSelected[0].id,
            }

            selectedAxis.value = temp
        }
    },
)
</script>

<style scoped>
input {
    text-align: center;
}
</style>
