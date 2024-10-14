<template>
    <div class="container-fluid p-0">
        <div class="row justify-content-center">
            <div class="col-auto">
                <h5 class="form-label">Import Model from File</h5>
            </div>
        </div>
        <div>
            <div class="row">
                <div class="col-xl-2"></div>
                <div class="col-6 col-xl-4">
                    <div class="row justify-content-center mb-4">
                        <div class="col-auto">
                            <input
                                ref="featureModelFileInputRef"
                                type="file"
                                webkitdirectory
                                directory
                                hidden
                                @change="onFeatureModelFileChange"
                            />
                            <button
                                type="button"
                                class="btn btn-light main-btn"
                                @click="modelImportButtonOnClick"
                            >
                                <i class="fa-solid fa-folder"></i>
                                Choose Directory
                            </button>
                        </div>
                    </div>
                    <div class="row justify-content-center mb-2">
                        <div class="col-auto my-auto">
                            <p class="m-0">
                                {{
                                    featureModelFileName?.length
                                        ? featureModelFileName
                                        : 'No Model imported'
                                }}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-6 col-xl-4">
                    <div class="row justify-content-center mb-3">
                        <div class="col-auto">
                            <input
                                ref="featureConfigFileInputRef"
                                type="file"
                                hidden
                                @change="onFeatureConfigFileChange"
                            />
                            <button
                                type="button"
                                class="btn btn-light main-btn"
                                :class="{
                                    disabled: !featureModelFileName?.length,
                                }"
                                @click="configImportButtonOnClick"
                            >
                                <i class="fa-solid fa-folder"></i>
                                Import Config File
                            </button>
                        </div>
                    </div>
                    <div class="row justify-content-center mb-2">
                        <div class="col-auto my-auto">
                            <p class="m-0">
                                {{
                                    featureModelFileName?.length
                                        ? featureConfigName
                                        : 'No Config imported'
                                }}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="col-xl-2"></div>
            </div>
            <div class="row-justify-content-center">
                <div class="col-12">
                    <div class="separator-model"></div>
                </div>
            </div>
            <div class="row">
                <div class="col-12 col-lg-6">
                    <TfaFeatureModelAdd
                        @addFeature="addFeature"
                        @setInvalidFeedback="setInvalidFeedback"
                    />
                    <div class="row mb-3 justify-content-center">
                        <div class="col-2"></div>
                        <label
                            for="samplingRateInput"
                            class="col-4 col-form-label"
                            >Sampling Rate</label
                        >
                        <div class="col-2">
                            <input
                                id="samplingRateInput"
                                v-model="samplingRate"
                                type="number"
                                class="form-control"
                                placeholder="8"
                                :disabled="!featureModelFileName?.length"
                                required
                            />
                        </div>
                        <label class="col-2 col-lg-3 col-form-label text-start"
                            >Hertz</label
                        >
                        <div class="col-2 col-lg-1"></div>
                    </div>
                    <div class="row mb-3 justify-content-center">
                        <div class="col-2"></div>
                        <label
                            for="selectedDownsamplingMethod"
                            class="col-4 col-form-label"
                            >Downsampling Method</label
                        >
                        <div class="col-4 col-lg-5 my-auto">
                            <select
                                id="selectedDownsamplingMethod"
                                ref="select"
                                v-model="selectedDownsamplingMethod"
                                class="form-select"
                                :disabled="!featureModelFileName?.length"
                            >
                                <option
                                    v-for="method in DOWNSAMPLING_METHODS"
                                    :key="method"
                                    :value="method"
                                >
                                    {{ method }}
                                </option>
                            </select>
                        </div>
                        <div class="col-2 col-lg-1"></div>
                    </div>
                </div>
                <div class="col-12 col-lg-6">
                    <div class="row justify-content-center">
                        <p>Feature Order</p>
                    </div>
                    <div class="row mb-3 justify-content-center">
                        <draggable
                            :disbaled="false"
                            :list="features"
                            item-key="id"
                            class="list-group p-0"
                            ghost-class="ghost"
                        >
                            <template #item="{ element }">
                                <div class="list-group-item">
                                    {{
                                        element.axis.name +
                                        '-' +
                                        element.feature.name +
                                        '-' +
                                        element.slidingWindow * samplingRate
                                    }}
                                    <button
                                        type="button"
                                        class="btn btn-default btn-circle me-1"
                                        @click="deleteFeature(element)"
                                    >
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </template>
                        </draggable>
                    </div>
                </div>
            </div>
            <div class="row justify-content-center my-3">
                <label
                    for="annotationFileNameInput"
                    class="col-5 col-lg-3 col-form-label"
                    >Annotation Filename</label
                >
                <div class="col-5 col-lg-3">
                    <input
                        id="annotationFileNameInput"
                        v-model="annotationFileName"
                        type="text"
                        class="form-control"
                        :disabled="!featureModelFileName?.length"
                        required
                    />
                </div>
            </div>
            <div class="row justify-content-center">
                <div class="col">
                    <button
                        type="submit"
                        class="btn btn-primary"
                        @click="onSubmit"
                    >
                        <div
                            v-if="loading"
                            class="spinner-border spinner-border-sm"
                        ></div>
                        Load Data in Model
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as tf from '@tensorflow/tfjs'
import draggable from 'vuedraggable'
import FEATURES from '../../../util/model/statistics'
import { type Feature } from '../../../util/model/statistics.js'
import { createFeatureInstances } from '../../../util/model/instance.js'
import {
    createLabelsForAnnotation,
    createNewAnnotationFile,
    selectAnnotationFile,
} from '../../../util/annotation.js'
import { checkImportedFiles } from '../../../util/model/import.js'
import { download } from '../../../util/inputOutput.js'
import { db } from '../../../db'

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

const store = useTfAnnotatorStore()

// refs
const featureModelFileInputRef = ref()
const featureConfigFileInputRef = ref()

// data
const model = ref<tf.LayersModel>()
const featureModelFileName = ref<string>()
const featureConfigName = ref<string>()
const annotationFileName = ref('ModelAnnotation')
const samplingRate = ref()
const features = ref<
    { axis: { id: unknown }; feature: Feature; slidingWindow: string }[]
>([])
const loading = ref(false)
const selectedDownsamplingMethod = ref<DownsamplingMethod>('First')

// methods
const modelImportButtonOnClick = () => {
    featureModelFileInputRef.value?.click()
}
const configImportButtonOnClick = () => {
    featureConfigFileInputRef.value?.click()
}
const onFeatureModelFileChange = (e: Event) => {
    try {
        checkImportedFiles(e, modelLoaded)
    } catch (error) {
        if (error instanceof Error) {
            setInvalidFeedback(error.message)
        }
    }

    if (featureModelFileInputRef.value) {
        featureModelFileInputRef.value.value = undefined
    }
}
const onFeatureConfigFileChange = (e: Event) => {
    if (!e.target || !(e.target instanceof HTMLInputElement) || !e.target.files)
        return

    const file = e.target.files[0]
    if (
        (file.name.toLowerCase().includes('configuration') ||
            file.name.toLowerCase().includes('config')) &&
        file.type.toLowerCase().includes('json')
    ) {
        clearModelConfiguration()
        setModelConfiguration(file)
    }

    if (featureConfigFileInputRef.value) {
        featureConfigFileInputRef.value.value = undefined
    }
}
const modelLoaded = (
    _model: tf.LayersModel,
    _modelFileName: string,
    config: File,
) => {
    featureModelFileName.value = _modelFileName
    model.value = _model
    features.value = []

    if (config) {
        setModelConfiguration(config)
    }
}
const setModelConfiguration = (config: File) => {
    featureConfigName.value = config.name
    const reader = new FileReader()
    reader.readAsText(config)
    reader.onload = () => {
        if (typeof reader.result !== 'string') return

        const json = JSON.parse(reader.result)
        samplingRate.value = json.samplingRate
        const features = json.features
        selectedDownsamplingMethod.value =
            json.downsamplingMethod || selectedDownsamplingMethod.value
        if (features) {
            features.forEach(
                (feature: {
                    axis: { id: number; name: string }
                    feature: Feature
                }) => {
                    const func = featureExists(feature)
                    if (func) {
                        const featureToAdd = feature
                        featureToAdd.feature.func = func
                        features.value.push(featureToAdd)
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
    for (let i = 0; i < FEATURES.length; i++) {
        if (
            FEATURES[i].name === feature.feature.name &&
            FEATURES[i].id === feature.feature.id
        ) {
            if (axisExists(feature.axis)) {
                return FEATURES[i].func
            } else {
                return null
            }
        }
    }
}
const axisExists = (axis: { id: number; name: string }) => {
    const _axes = store.axesSelected
    for (const i in Object.values(_axes)) {
        if (_axes[i].name === axis.name && _axes[i].id === axis.id) {
            return true
        }
    }
    return false
}
const addFeature = (featureData: {
    axis: { id: unknown }
    feature: Feature
    slidingWindow: string
}) => {
    features.value.push(featureData)
}
const setInvalidFeedback = (invalidFeedback: string) => {
    emit('setInvalidFeedback', invalidFeedback)
}
const onSubmit = (e: Event) => {
    loading.value = true
    e.preventDefault()
    if (!validateInputs()) {
        loading.value = false
        return
    }
    setTimeout(loadDataIntoModel, 10)
}
const loadDataIntoModel = async () => {
    try {
        // get converted data for feature model
        if (!store.dataSelector) return

        const {
            instances,
            offset: offsetInSeconds,
            smallestFeatureWindow,
        } = createFeatureInstances(
            store.data[store.dataSelector],
            features.value,
            samplingRate.value,
            selectedDownsamplingMethod.value,
        )
        const predictedValues = []
        // make prediction
        // eslint-disable-next-line import/namespace
        const tensor = tf.tensor(instances)
        if (!model.value) return
        const a = model.value.predict(tensor) as tf.Tensor<tf.Rank.R2>
        predictedValues.push({ data: a.arraySync() })
        // create annotation file
        const annotationId = await createNewAnnotationFile(
            annotationFileName.value,
        )
        // create as many labels as needed
        const labelAmount = predictedValues[0].data[0].length
        await createLabelsForAnnotation(annotationId, labelAmount, store.colors)
        // create all the areas
        const allLabels = await db.labels
            .where('annotationId')
            .equals(annotationId)
            .toArray()
        let timestamp = store.timestampsSelected[0] + 1000 * offsetInSeconds
        let nextTimestamp
        // evaluate predictions and add areas to db
        predictedValues[0].data.forEach((prediction) => {
            nextTimestamp = timestamp + 1000 * smallestFeatureWindow
            const max = Math.max(...prediction)
            if (max) {
                const index = prediction.indexOf(max)
                const label = allLabels[index]
                db.areas.add({
                    annotationId,
                    labelId: label.id,
                    firstTimestamp: timestamp,
                    secondTimestamp: nextTimestamp,
                    y1: 0,
                    y2: 1,
                    yAmount: 1,
                })
                db.areas.add({
                    annotationId,
                    labelId: label.id,
                    firstTimestamp: timestamp,
                    secondTimestamp: nextTimestamp,
                    yAmount: null,
                    y1: null,
                    y2: null,
                })
            }
            timestamp = nextTimestamp
        })
        // select newly created annotaion file
        await selectAnnotationFile(annotationId)
        if (!store.isAreasVisible) {
            store.toggleAreasVisibility()
        }
        loading.value = false
        emit('closeModal')
    } catch (error) {
        loading.value = false

        if (error instanceof Error) {
            setInvalidFeedback(error.message)
        }
    }
}
const validateInputs = () => {
    let invalidFeedback = ''
    if (!model.value) {
        invalidFeedback = 'No Model imported yet!'
    } else if (samplingRate.value < 0) {
        invalidFeedback = 'Sampling Rate can not be a negative Number!'
    } else if (features.value.length === 0) {
        invalidFeedback = 'At least one Feature has to be added!'
    }
    if (invalidFeedback.length === 0) {
        return true
    } else {
        setInvalidFeedback(invalidFeedback)
        return false
    }
}
const deleteFeature = (feature: {
    axis: { id: unknown }
    feature: Feature
    slidingWindow: string
}) => {
    const index = features.value.indexOf(feature)
    features.value.splice(index, 1)
}
const prepareConfigDownload = () => {
    const config = {
        samplingRate: samplingRate.value,
        features: features.value,
    }
    download(
        JSON.stringify(config),
        'text/json',
        { 'text/json': ['.json'] },
        'config.json',
    )
}

// lifecycle
watch(
    () => props.toggleConfigDownload,
    () => {
        prepareConfigDownload()
    },
)
</script>

<style scoped>
input {
    text-align: center;
}

.list-group-item {
    cursor: move;
    cursor: grab;
    cursor: -moz-grab;
    cursor: -webkit-grab;
}

.list-group-item:active {
    cursor: grabbing;
    cursor: -moz-grabbing;
    cursor: -webkit-grabbing;
}

.btn-circle {
    height: 1.5rem;
    width: 1.5rem;
    border-radius: 50%;
    text-align: center;
    background-color: #bbb;
    opacity: 0.7;
    padding: 0px;
    font-size: 0.75rem;
}
</style>
