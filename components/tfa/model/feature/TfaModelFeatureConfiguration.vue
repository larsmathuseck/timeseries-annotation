<template>
    <div>
        <div>
            <div>
                <h5>Import Model from File</h5>
            </div>
        </div>
        <div>
            <div>
                <div>
                    <TfaFileImportButton
                        ref="featureModelFileInputRef"
                        label="Choose Directory"
                        icon-class="fa-folder"
                        @change="onModelFeatureFileChange"
                        @click="modelImportButtonOnClick"
                    />
                    <TfaFileStatusDisplay
                        :file-name="featureModelFileName"
                        default-text="No Model imported"
                    />
                </div>

                <div>
                    <TfaFileImportButton
                        ref="featureConfigFileInputRef"
                        :disabled="!isModelImported"
                        icon-class="fa-file"
                        label="Import Config File"
                        @change="onFeatureConfigFileChange"
                        @click="configImportButtonOnClick"
                    />
                    <TfaFileStatusDisplay
                        :file-name="featureConfigName"
                        :default-text="'No Config imported'"
                    />
                </div>
            </div>
            <!-- <Separator /> -->
            <div>
                <div>
                    <TfaModelFeatureAdd
                        @add-feature="addFeature"
                        @set-invalid-feedback="setInvalidFeedback"
                    />
                    <TfaFormRow label="Sampling Rate" unit="Hertz">
                        <input
                            id="samplingRateInput"
                            v-model="samplingRate"
                            type="number"
                            placeholder="8"
                            :disabled="!isModelImported"
                            required
                        />
                    </TfaFormRow>
                    <TfaFormRow label="Downsampling Method">
                        <select
                            id="selectedDownsamplingMethod"
                            ref="select"
                            v-model="selectedDownsamplingMethod"
                            :disabled="!isModelImported"
                        >
                            <option
                                v-for="method in DOWNSAMPLING_METHODS"
                                :key="method"
                                :value="method"
                            >
                                {{ method }}
                            </option>
                        </select>
                    </TfaFormRow>
                </div>
                <div>
                    <div>
                        <p>Feature Order</p>
                    </div>
                    <div>
                        <draggable
                            :list="features"
                            item-key="id"
                            ghost-class="ghost"
                        >
                            <template #item="{ element }">
                                <div v-if="samplingRate !== undefined">
                                    {{ element.axis.name }}-{{
                                        element.feature.name
                                    }}-{{
                                        element.slidingWindow * samplingRate
                                    }}
                                    <Button
                                        size="icon"
                                        type="button"
                                        variant="outline"
                                        @click="deleteFeature(element)"
                                    >
                                        <IHeroiconsTrash />
                                    </Button>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>
            </div>
            <div>
                <TfaFormRow label="Annotation Filename">
                    <input
                        id="annotationFileNameInput"
                        v-model="annotationFileName"
                        type="text"
                        :disabled="!isModelImported"
                        required
                    />
                </TfaFormRow>
            </div>
            <div>
                <div>
                    <Button type="submit" @click="onSubmit">
                        <div v-if="loading"></div>
                        Load Data in Model
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { LayersModel, Tensor, Rank } from '@tensorflow/tfjs'
import { tensor } from '@tensorflow/tfjs'
import draggable from 'vuedraggable'

const DOWNSAMPLING_METHODS = ['First', 'Last', 'Median'] as const
type DownsamplingMethod = (typeof DOWNSAMPLING_METHODS)[number]

interface Props {
    toggleConfigDownload: boolean
}
const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
    closeModal: []
    setInvalidFeedback: [invalidFeedback: string]
}>()

const store = useTfaStore()

// refs
const featureModelFileInputRef = ref<HTMLInputElement>()
const featureConfigFileInputRef = ref<HTMLInputElement>()

// data
const model = ref<LayersModel>()
const featureModelFileName = ref<string>()
const featureConfigName = ref<string>()
const annotationFileName = ref('ModelAnnotation')
const samplingRate = ref<number>()
const features = ref<
    Array<{ axis: { id: number }; feature: Feature; slidingWindow: number }>
>([])
const loading = ref(false)
const selectedDownsamplingMethod = ref<DownsamplingMethod>('First')

// methods
const triggerFileInput = (ref?: Ref<HTMLInputElement | undefined>) => {
    ref?.value?.click()
}
const handleFileInputChange = (
    ref: Ref<HTMLInputElement | undefined>,
    handler: () => void,
) => {
    handler()
    ref.value = undefined
}
const modelImportButtonOnClick = () =>
    triggerFileInput(featureModelFileInputRef)
const configImportButtonOnClick = () =>
    triggerFileInput(featureConfigFileInputRef)
const onModelFeatureFileChange = (e: Event) => {
    try {
        checkImportedFiles(e, modelLoaded)
    } catch (error) {
        if (error instanceof Error) {
            setInvalidFeedback(error.message)
        }
    }
    handleFileInputChange(featureModelFileInputRef, () => {})
}
const onFeatureConfigFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement)?.files?.[0]

    if (!file) return

    if (
        (file.name.toLowerCase().includes('config') ||
            file.name.toLowerCase().includes('configuration')) &&
        file.type.toLowerCase().includes('json')
    ) {
        clearModelConfiguration()
        setModelConfiguration(file)
    }

    handleFileInputChange(featureConfigFileInputRef, () => {})
}

const modelLoaded = (
    loadedModel: LayersModel,
    modelFileName: string,
    config?: File,
) => {
    featureModelFileName.value = modelFileName
    model.value = loadedModel
    features.value = []

    if (config) setModelConfiguration(config)
}
const setModelConfiguration = (config: File) => {
    const reader = new FileReader()
    reader.readAsText(config)
    reader.onload = () => {
        if (typeof reader.result !== 'string') return

        const json = JSON.parse(reader.result)
        samplingRate.value = json.samplingRate
        selectedDownsamplingMethod.value =
            json.downsamplingMethod || selectedDownsamplingMethod.value

        if (json.features) {
            json.features.forEach(
                (feature: {
                    axis: { id: number; name: string }
                    feature: Feature
                    slidingWindow: number
                }) => {
                    const func = featureExists(feature)
                    if (func) {
                        feature.feature.func = func
                        features.value.push(feature)
                    }
                },
            )
        }
    }
}
const clearModelConfiguration = () => {
    samplingRate.value = undefined
    features.value = []
    selectedDownsamplingMethod.value = 'First'
}
const featureExists = (feature: {
    axis: { id: number; name: string }
    feature: Feature
}) => {
    const featureMatch = FEATURES.find(
        (f) => f.name === feature.feature.name && f.id === feature.feature.id,
    )
    return featureMatch && axisExists(feature.axis) ? featureMatch.func : null
}
const axisExists = (axis: { id: number; name: string }) => {
    return Object.values(store.dataFileSelectedAxes).some(
        (a) => a.name === axis.name && a.id === axis.id,
    )
}
const addFeature = (featureData: {
    axis: { id: number }
    feature: Feature
    slidingWindow: number
}) => {
    features.value.push(featureData)
}
const setInvalidFeedback = (invalidFeedback: string) => {
    emit('setInvalidFeedback', invalidFeedback)
}
const validateInputs = (): boolean => {
    if (!model.value) {
        setInvalidFeedback('No Model imported yet!')
        return false
    }
    if (samplingRate.value && samplingRate.value < 0) {
        setInvalidFeedback('Sampling Rate cannot be negative!')
        return false
    }
    if (features.value.length === 0) {
        setInvalidFeedback('At least one Feature has to be added!')
        return false
    }
    return true
}
const onSubmit = (e: Event) => {
    e.preventDefault()
    if (!validateInputs()) return
    loading.value = true
    setTimeout(loadDataIntoModel, 10)
}
const loadDataIntoModel = async () => {
    try {
        if (!store.dataFileSelectedId || !model.value) return

        const {
            instances,
            offset: offsetInSeconds,
            smallestFeatureWindow,
        } = createFeatureInstances(
            store.dataFiles[store.dataFileSelectedId],
            features.value,
            samplingRate.value!,
            selectedDownsamplingMethod.value,
        )

        const tensorInstace = tensor(instances)
        const predictionTensor = model.value.predict(
            tensorInstace,
        ) as Tensor<Rank.R2>
        const predictedValues = predictionTensor.arraySync()

        const annotationId = await annotationFileCreate(
            annotationFileName.value,
        )
        const labelAmount = predictedValues[0].length
        await annotationLabelsAdd(annotationId, labelAmount)

        const allLabels = await database.annotationLabel
            .where('annotationId')
            .equals(annotationId)
            .toArray()
        let timestamp =
            store.dataFileSelectedTimestamps[0] + 1000 * offsetInSeconds

        predictedValues.forEach((prediction) => {
            const nextTimestamp = timestamp + 1000 * smallestFeatureWindow
            const maxPrediction = Math.max(...prediction)
            if (maxPrediction) {
                const label = allLabels[prediction.indexOf(maxPrediction)]
                database.annotationArea.bulkAdd([
                    {
                        annotationId,
                        labelId: label.id,
                        timestampFrom: timestamp,
                        timestampTo: nextTimestamp,
                        yFrom: 0,
                        yTo: 1,
                        yAmount: 1,
                    },
                    {
                        annotationId,
                        labelId: label.id,
                        timestampFrom: timestamp,
                        timestampTo: nextTimestamp,
                        yAmount: null,
                        yFrom: null,
                        yTo: null,
                    },
                ])
            }
            timestamp = nextTimestamp
        })

        await selectAnnotationFile(annotationId)
        if (!store.isAreasVisible) store.toggleAreasVisibility()
        emit('closeModal')
    } catch (error) {
        if (error instanceof Error) setInvalidFeedback(error.message)
    } finally {
        loading.value = false
    }
}
const deleteFeature = (feature: {
    axis: { id: number }
    feature: Feature
    slidingWindow: number
}) => {
    const index = features.value.indexOf(feature)
    features.value.splice(index, 1)
}
const prepareConfigDownload = () => {
    const config = {
        samplingRate: samplingRate.value,
        features: features.value,
    }
    download({
        data: JSON.stringify(config),
        fileType: 'text/json',
        // { 'text/json': ['.json'] },
        name: 'config.json',
    })
}

// computations
const isModelImported = computed(() => !!featureModelFileName.value?.length)

// lifecycle
watch(() => props.toggleConfigDownload, prepareConfigDownload)
</script>
