<template>
    <div id="modelConfigurationSubmit">
        <div class="container-fluid p-0">
            <div class="row justify-content-center">
                <div class="col-auto">
                    <h5 class="form-label">Import Model from File</h5>
                </div>
            </div>
            <div class="row">
                <div class="col-xl-2"></div>
                <div class="col-6 col-xl-4">
                    <div class="row justify-content-center mb-4">
                        <div class="col-auto">
                            <input
                                ref="modelFileInputRef"
                                type="file"
                                webkitdirectory
                                directory
                                hidden
                                @change="onModelFileChange"
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
                                    modelFileName?.length
                                        ? modelFileName
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
                                ref="configFileInputRef"
                                type="file"
                                hidden
                                @change="onConfigFileChange"
                            />
                            <button
                                type="button"
                                class="btn btn-light main-btn"
                                :class="{ disabled: !modelFileName?.length }"
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
                                    configName?.length
                                        ? configName
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
                    <div class="row mb-3 justify-content-center">
                        <label
                            for="slidingWindowInput"
                            class="col-6 col-form-label"
                            >Sliding Window</label
                        >
                        <div class="col-2 col-lg-3">
                            <input
                                id="slidingWindowInput"
                                v-model="slidingWindow"
                                type="text"
                                class="form-control"
                                placeholder="4"
                                :disabled="!modelFileName?.length"
                                required
                            />
                        </div>
                        <label class="col-4 col-lg-3 col-form-label text-left"
                            >Seconds</label
                        >
                    </div>
                    <div class="row mb-3 justify-content-center">
                        <label
                            for="samplingRateInput"
                            class="col-6 col-form-label"
                            >Sampling Rate</label
                        >
                        <div class="col-2 col-lg-3">
                            <input
                                id="samplingRateInput"
                                v-model="samplingRate"
                                type="number"
                                class="form-control"
                                placeholder="8"
                                :disabled="!modelFileName?.length"
                                required
                            />
                        </div>
                        <label class="col-4 col-lg-3 col-form-label text-left"
                            >Hertz</label
                        >
                    </div>
                    <div class="row mb-3 justify-content-center">
                        <label
                            for="windowShiftInput"
                            class="col-6 col-form-label"
                            >Window Shift</label
                        >
                        <div class="col-2 col-lg-3">
                            <input
                                id="windowShiftInput"
                                v-model="windowShift"
                                type="text"
                                class="form-control"
                                placeholder="1"
                                :disabled="!modelFileName?.length"
                                required
                            />
                        </div>
                        <label class="col-4 col-lg-3 col-form-label text-left"
                            >Seconds</label
                        >
                    </div>
                    <div class="row mb-3 justify-content-center">
                        <label
                            for="selectedDownsamplingMethod"
                            class="col-6 col-form-label"
                            >Downsampling Method</label
                        >
                        <div class="col-5 col-lg-6">
                            <select
                                id="selectedDownsamplingMethod"
                                ref="select"
                                v-model="selectedDownsamplingMethod"
                                class="form-select"
                                :disabled="!modelFileName?.length"
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
                        <div class="col-1 col-lg-0"></div>
                    </div>
                </div>
                <div class="col-12 col-lg-6">
                    <div class="row">
                        <div class="container-fluid">
                            <p>Axis Selection</p>
                            <div class="row justify-content-center">
                                <div class="list-group px-2">
                                    <label
                                        v-for="axis in store.axesSelected"
                                        :key="axis.id"
                                        class="list-group-item"
                                    >
                                        <input
                                            v-model="selectedAxes"
                                            class="form-check-input me-1"
                                            type="checkbox"
                                            :value="{
                                                id: axis.id,
                                                name: axis.name,
                                            }"
                                            :disabled="!modelFileName?.length"
                                        />
                                        {{ axis.name }}
                                    </label>
                                </div>
                            </div>
                            <div class="row justify-content-center">
                                <div class="col-auto">
                                    <label
                                        v-for="axis in selectedAxes"
                                        :key="axis.id"
                                        class="pe-2"
                                    >
                                        {{
                                            selectedAxes.indexOf(axis) +
                                            1 +
                                            '. ' +
                                            axis.name +
                                            ',\t'
                                        }}
                                    </label>
                                </div>
                            </div>
                            <div class="row justify-content-center py-3">
                                <div class="col-auto">
                                    <button
                                        type="button"
                                        class="btn btn-danger"
                                        @click="resetAxisSelection"
                                    >
                                        Clear Axis Selection
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
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
                    :disabled="!modelFileName?.length"
                    required
                />
            </div>
        </div>
        <div class="row justify-content-center">
            <div class="col">
                <button type="submit" class="btn btn-primary" @click="onSubmit">
                    <div
                        v-if="loading"
                        class="spinner-border spinner-border-sm"
                    ></div>
                    Load Data in Model
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as tf from '@tensorflow/tfjs'
import { type ArrayMap } from '@tensorflow/tfjs-core/dist/types'
import { consola } from 'consola'

import { db, Label } from '../../../db'
import { createInstances } from '../../../util/model/instance.js'
import { checkImportedFiles } from '../../../util/model/import.js'
import {
    createNewAnnotationFile,
    createLabelsForAnnotation,
    selectAnnotationFile,
} from '../../../util/annotation.js'
import { download } from '../../../util/inputOutput.js'

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
const modelFileInputRef = ref()
const configFileInputRef = ref()

// data
const model = ref<tf.LayersModel>()
const modelFileName = ref<string>()
const configName = ref<string>()
const annotationFileName = ref('ModelAnnotation')
const slidingWindow = ref()
const samplingRate = ref()
const windowShift = ref()
const selectedAxes = ref<
    {
        id: number
        name: string
    }[]
>([])
const selectedDownsamplingMethod = ref<DownsamplingMethod>('First')
const loading = ref(false)

// computed: {
//     axes() {
//         return store.axesSelected
//     },
// },

// methods
const modelImportButtonOnClick = () => {
    modelFileInputRef.value?.click()
}
const configImportButtonOnClick = () => {
    configFileInputRef.value?.click()
}
const onModelFileChange = (e: Event) => {
    try {
        checkImportedFiles(e, modelLoaded)
    } catch (error) {
        if (error instanceof Error) {
            consola.error(error.message)
            setInvalidFeedback(error.message)
        }
    }

    if (modelFileInputRef.value) {
        modelFileInputRef.value.value = undefined
    }
}
const onConfigFileChange = (e: Event) => {
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

    if (configFileInputRef.value) {
        configFileInputRef.value.value = undefined
    }
}
const modelLoaded = (
    _model: tf.LayersModel,
    _modelFileName: string,
    config: File,
) => {
    model.value = _model
    modelFileName.value = _modelFileName
    selectedAxes.value = []

    if (config) {
        setModelConfiguration(config)
    }
}
const setModelConfiguration = (config: File) => {
    configName.value = config.name
    const reader = new FileReader()
    reader.readAsText(config)
    reader.onload = () => {
        if (typeof reader.result !== 'string') return

        const json = JSON.parse(reader.result)
        slidingWindow.value = json.slidingWindow
        samplingRate.value = json.samplingRate
        windowShift.value = json.windowShift
        selectedDownsamplingMethod.value =
            json.downsamplingMethod || selectedDownsamplingMethod.value
        const selectedAxes = json.selectedAxes
        if (selectedAxes) {
            selectedAxes.forEach((axis: { id: number; name: string }) => {
                if (axisExists(axis)) {
                    selectedAxes.value.push(axis)
                }
            })
        }
    }
}
const clearModelConfiguration = () => {
    slidingWindow.value = undefined
    samplingRate.value = undefined
    windowShift.value = undefined
    selectedDownsamplingMethod.value = 'First'
    selectedAxes.value = []
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
const resetAxisSelection = () => {
    selectedAxes.value = []
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
    if (!model.value) return
    const modelConfiguration = {
        model: model.value,
        slidingWindow: slidingWindow.value,
        samplingRate: samplingRate.value,
        windowShift: windowShift.value,
        selectedAxes: selectedAxes.value,
        downsamplingMethod: selectedDownsamplingMethod.value,
    }
    setTimeout(() => loadDataIntoModel(modelConfiguration), 10)
}
const validateInputs = () => {
    let invalidFeedback = ''
    const data = store.data
    if (!model.value) {
        invalidFeedback = 'No Model imported yet!'
    } else if (isNaN(slidingWindow.value)) {
        invalidFeedback = 'Sliding Window must be a number!'
    } else if (slidingWindow.value < 0) {
        invalidFeedback = 'Sliding Window can not be a negative Number!'
    } else if (samplingRate.value < 0) {
        invalidFeedback = 'Sampling Rate can not be a negative Number!'
    } else if (isNaN(windowShift.value)) {
        invalidFeedback = 'Window Shift must be a number!'
    } else if (windowShift.value >= slidingWindow.value) {
        invalidFeedback = 'Window Shift must be less than Sliding Window!'
    } else if (windowShift.value < 0) {
        invalidFeedback = 'Window Shift can not be a negative Number!'
    } else if (
        windowShift.value !== 0 &&
        isMultiple(slidingWindow.value, windowShift.value) !== 0
    ) {
        invalidFeedback = 'Sliding Window must be a multiple from Window Shift!'
    } else if (isMultiple(samplingRate.value * windowShift.value, 1) !== 0) {
        invalidFeedback = 'Window Shift * Sampling Rate must be an Integer!'
    } else if (Object.entries(data).length === 0) {
        invalidFeedback = 'Please upload data first!'
    } else if (selectedAxes.value.length === 0) {
        invalidFeedback = 'At least one Axis has to be chosen!'
    }
    if (invalidFeedback.length === 0) {
        return true
    } else {
        setInvalidFeedback(invalidFeedback)
        return false
    }
}
const loadDataIntoModel = async (modelConfiguration: {
    model: tf.LayersModel
    slidingWindow: number
    samplingRate: number
    windowShift: number
    selectedAxes: {
        id: number
    }[]
    downsamplingMethod: DownsamplingMethod
}) => {
    const model = modelConfiguration.model

    try {
        // get converted data for use in model. Every instance includes the next window shift.
        const instances = createInstances(store, modelConfiguration)
        if (!instances) return
        const slotsNumber =
            instances.segmentsLength /
            (modelConfiguration.samplingRate * modelConfiguration.windowShift)
        const _instances = instances.allInstances
        const predictedValues: {
            data: ArrayMap[tf.Rank.R2]
            timestamps: {
                end: number
                start: number
            }[]
        }[] = []
        if (!_instances) return
        // make predictions
        for (const instance of _instances) {
            // eslint-disable-next-line import/namespace
            const tensor = tf.tensor(instance.dataArray)
            const a = model.predict(tensor) as tf.Tensor<tf.Rank.R2>

            if (!Array.isArray(a)) {
                predictedValues.push({
                    data: a.arraySync(),
                    timestamps: instance.timeArray,
                })
            }
        }
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
        let predIndex = 0
        // evaluate predictions and add areas to db
        predictedValues.forEach((prediction) => {
            for (let i = 0; i < prediction.data.length; i++) {
                const max = Math.max(...prediction.data[i])
                if (max) {
                    const index = prediction.data[i].indexOf(max)
                    const label = allLabels[index]
                    db.areas.add({
                        annotationId,
                        labelId: label.id,
                        firstTimestamp: prediction.timestamps[i].start,
                        secondTimestamp: prediction.timestamps[i].end,
                        y1: predIndex,
                        y2: predIndex + 1,
                        yAmount: predictedValues.length,
                    })
                }
            }
            predIndex += 1
        })
        // create majority vote overview shown at bottom of the graph
        if (modelConfiguration.windowShift > 0) {
            addCompleteResultOverview(
                predictedValues,
                slotsNumber,
                allLabels,
                annotationId,
                modelConfiguration.windowShift,
                predIndex,
            )
        }
        // select newly created annotaion file
        await selectAnnotationFile(annotationId)
    } catch (error) {
        loading.value = false

        if (error instanceof Error) {
            consola.error(error.message)
            setInvalidFeedback(error.message)
        }
        return
    }

    if (!store.isAreasVisible) {
        store.toggleAreasVisibility()
    }

    loading.value = false
    emit('closeModal')
}
const addCompleteResultOverview = (
    predictedValues: {
        data: ArrayMap[tf.Rank.R2]
        timestamps: {
            end: number
            start: number
        }[]
    }[],
    slotsNumber: number,
    allLabels: Label[],
    annotationId: number,
    windowShift: number,
    predIndex: number,
) => {
    let timestamp = predictedValues[0].timestamps[0].start
    // two dimensional array that saves the current position for every prediction (windowShift)
    const currentPositions: (number | null | undefined)[] = []
    for (let i = 0; i < predictedValues.length; i++) {
        currentPositions.push(null)
    }
    for (let i = 0; i < slotsNumber; i++) {
        const position = i % predictedValues.length
        // update current positions of the prediction arrays
        if (!currentPositions[position]) {
            currentPositions[position] = 0
        } else {
            currentPositions[position] += 1
            if (currentPositions[position] >= predictedValues[0].data.length) {
                currentPositions[position] = undefined
            }
        }
        const indices: Record<number, number> = {}
        // evaluate predicitons for current position
        for (let j = 0; j < predictedValues.length; j++) {
            const currentPosition = currentPositions[j]
            if (!currentPosition) continue

            const data = predictedValues[j].data[currentPosition]
            const index = data?.indexOf(Math.max(...data))
            const labelId = allLabels[index]?.id
            if (!labelId) {
                continue
            } else if (!indices[labelId]) {
                indices[labelId] = 1
            } else {
                indices[labelId] += 1
            }
        }
        // set result, null when likelyhood for all the predictions for the position the same
        const result = Object.keys(indices)
            .map((key) => parseInt(key))
            .reduce((a, b) => {
                if (indices[a] > indices[b]) {
                    return a
                } else if (indices[a] < indices[b]) {
                    return b
                } else {
                    return 0 // TODO: check previous "null"
                }
            })
        // add areas to db
        if (result) {
            db.areas.add({
                annotationId,
                labelId: result,
                firstTimestamp: timestamp,
                secondTimestamp: timestamp + windowShift * 1000,
                y1: predIndex,
                y2: predIndex + 1,
                yAmount: null,
            })
        }
        timestamp += windowShift * 1000
    }
}
const isMultiple = (a: number, b: number) => {
    // this function is needed, since the normal Javascript modulo seem to not work like expected. With this we only check if the result of division is an float by searching for a comma.
    const temp = (a / b).toString()
    const commaIndex = temp.indexOf('.')
    return commaIndex === -1 ? 0 : commaIndex
}
const prepareConfigDownload = () => {
    const config = {
        slidingWindow: slidingWindow.value,
        samplingRate: samplingRate.value,
        windowShift: windowShift.value,
        downsamplingMethod: selectedDownsamplingMethod.value,
        selectedAxes: selectedAxes.value,
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

.text-left {
    text-align: left;
}

.list-group {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr);
    border-radius: 0;
}

.list-group-item {
    border: 1px solid rgba(0, 0, 0, 0.125) !important;
    border-radius: 0rem;
}
</style>
