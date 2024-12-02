<template>
    <div>
        <div>
            <TfaModelFeatureAddRow label="Axis" label-for="selectedAxis">
                <select id="selectedAxis" v-model="axis" required>
                    <option
                        v-for="selectedAxis in store.dataFileSelectedAxes"
                        :key="selectedAxis.id"
                        :value="selectedAxis"
                    >
                        {{ selectedAxis.name }}
                    </option>
                </select>
            </TfaModelFeatureAddRow>
            <TfaModelFeatureAddRow label="Feature" label-for="selectedFeature">
                <select id="selectedFeature" v-model="selectedFeature" required>
                    <option
                        v-for="feature in FEATURES"
                        :key="feature.id"
                        :value="feature"
                    >
                        {{ feature.name }}
                    </option>
                </select>
            </TfaModelFeatureAddRow>
            <TfaModelFeatureAddRow
                label="Sliding Window"
                label-for="slidingWindowInput"
            >
                <div>
                    <input
                        id="slidingWindowInput"
                        v-model.number="slidingWindow"
                        type="number"
                        placeholder="4"
                        aria-label="Sliding Window in seconds"
                        required
                    />
                </div>
                <span>Seconds</span>
            </TfaModelFeatureAddRow>
            <Button type="submit" @click="onSubmit">
                <span>Add</span>
                <IHeroiconsPlus />
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
    addFeature: [
        featureConfiguration: {
            id: number
            feature: Feature
            slidingWindow: number
            axis: { id: number; name: string }
        },
    ]
    setInvalidFeedback: [invalidFeedback: string]
}>()

const store = useTfaStore()

// data
const axis = ref<{ id: number; name: string }>()
const counter = ref(0)
const selectedFeature = ref(FEATURES[0])
const slidingWindow = ref<number>()

// methods
const onSubmit = (e: Event) => {
    e.preventDefault()
    if (!validateInputs()) return

    const feature = { ...selectedFeature.value }

    const featureConfiguration = {
        id: counter.value,
        feature,
        slidingWindow: slidingWindow.value as number,
        axis: axis.value as { id: number; name: string },
    }
    counter.value++
    emit('addFeature', featureConfiguration)
}
const validateInputs = (): boolean => {
    let invalidFeedback = ''
    if (!slidingWindow.value || isNaN(slidingWindow.value)) {
        invalidFeedback = 'Sliding Window must be a valid number!'
    } else if (slidingWindow.value < 0) {
        invalidFeedback = 'Sliding Window cannot be negative!'
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
    () => store.dataFileSelectedAxes,
    (axes) => {
        if (axes[0]) {
            axis.value = { ...axes[0] }
        }
    },
)
</script>
