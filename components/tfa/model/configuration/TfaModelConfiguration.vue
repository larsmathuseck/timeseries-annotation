<template>
    <form class="flex flex-col gap-4" @submit="onSubmit">
        <h5 class="form-label">Import Model from File</h5>
        <div class="flex gap-4">
            <Button class="flex gap-2 w-full" type="button" variant="secondary">
                <!-- @click="tryFolderDialogOpen" -->
                <IHeroiconsFolder />
                <span>Choose Directory</span>
            </Button>
            <Button class="flex gap-2 w-full" type="button" variant="secondary">
                <!-- @click="tryFolderDialogOpen" -->
                <IHeroiconsFolder />
                <span>Import Config File</span>
            </Button>
            <TfaModelConfigurationFileUpload
                ref="modelFileInputRef"
                :label="'Choose Directory'"
                :file-name="modelFileName"
                :placeholder="'No Model imported'"
                :on-file-change="onModelFileChange"
                :button-click="modelImportButtonOnClick"
                :directory="true"
            />
            <TfaModelConfigurationFileUpload
                ref="configFileInputRef"
                :label="'Import Config File'"
                :file-name="configName"
                :placeholder="'No Config imported'"
                :disabled="!modelFileName"
                :on-file-change="onConfigFileChange"
                :button-click="configImportButtonOnClick"
            />
        </div>
        <!-- <Separator /> -->
        <div class="flex gap-4">
            <div class="flex flex-col gap-2">
                <TfaModelConfigurationFormInput
                    label="Sliding Window"
                    :placeholder="4"
                    :disabled="!modelFileName"
                    unit="second"
                    :value="slidingWindow"
                    @input="slidingWindow = $event"
                />
                <TfaModelConfigurationFormInput
                    label="Sampling Rate (Hz)"
                    :placeholder="8"
                    :disabled="!modelFileName"
                    :value="samplingRate"
                    @input="samplingRate = $event"
                />
                <!-- unit="frequency-hertz" -->
                <TfaModelConfigurationFormInput
                    label="Window Shift"
                    :placeholder="1"
                    :disabled="!modelFileName"
                    unit="second"
                    :value="windowShift"
                    @input="windowShift = $event"
                />
                <FormField
                    v-slot="{ componentField }"
                    name="downsamplingMethod"
                >
                    <FormItem>
                        <FormLabel>Downsampling Method</FormLabel>
                        <Select
                            v-bind="componentField"
                            :disabled="!modelFileName"
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <!-- <SelectLabel>Fruits</SelectLabel> -->
                                    <SelectItem
                                        v-for="method in DOWNSAMPLING_METHODS"
                                        :key="method"
                                        :value="method"
                                    >
                                        {{ method }}
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </FormItem>
                </FormField>
            </div>
            <FormField v-slot="{ componentField }" name="axisSelection">
                <FormItem>
                    <FormLabel>Axis Selection</FormLabel>
                    <FormControl>
                        <Checkbox
                            v-for="axis in store.dataFileSelectedAxes"
                            v-bind="componentField"
                            :key="axis.id"
                            :disabled="!modelFileName"
                            :value="axis.name"
                        />
                        <p v-for="axis in selectedAxes" :key="axis.id">
                            {{ selectedAxes.indexOf(axis) + 1 }}.
                            {{ axis.name }}
                        </p>
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                    <Button
                        type="button"
                        variant="destructive"
                        @click="resetAxisSelection"
                    >
                        Clear Axis Selection
                    </Button>
                </FormItem>
            </FormField>
            <!-- <TfaModelConfigurationAxisSelection
                :axes="store.axes"
                :selected-axes="selectedAxes"
                :disabled="!modelFileName"
                @clearSelection="resetAxisSelection"
                @input="selectedAxes = $event"
            /> -->
        </div>
        <FormField v-slot="{ componentField }" name="annotationFilename">
            <FormItem>
                <FormLabel>Annotation Filename</FormLabel>
                <FormControl>
                    <Input :disabled="!modelFileName" v-bind="componentField" />
                </FormControl>
                <FormDescription />
                <FormMessage />
            </FormItem>
        </FormField>
        <Button type="submit" variant="secondary">
            <Loader2 v-if="loading" />
            <span>Load Data in Model</span>
        </Button>
    </form>
</template>

<script setup lang="ts">
import type { LayersModel, Rank, Tensor } from '@tensorflow/tfjs'
import type { ArrayMap, TensorLike } from '@tensorflow/tfjs-core/dist/types'
// import { toTypedSchema } from '@vee-validate/zod'
// import { useForm } from 'vee-validate'
// import { z } from 'zod'
import tf from '@tensorflow/tfjs'

import { Loader2 } from 'lucide-vue-next'

enum DOWNSAMPLING_METHODS {
    First = 'First',
    Last = 'Last',
    Median = 'Median',
}

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
const modelFileInputRef = ref<HTMLInputElement>()
const configFileInputRef = ref<HTMLInputElement>()

// data
const model = ref<LayersModel>()
const modelFileName = ref<string>()
const configName = ref<string>()
const annotationFileName = ref('ModelAnnotation')
const slidingWindow = ref<number>()
const samplingRate = ref<number>()
const windowShift = ref<number>()
const selectedAxes = ref<{ id: number; name: string }[]>([])
const selectedDownsamplingMethod = ref<DOWNSAMPLING_METHODS>(
    DOWNSAMPLING_METHODS.First,
)
const loading = ref(false)
// const formSchema = toTypedSchema(
//     z.object({
//         annotationFilename: z
//             .string()
//             .min(1)
//             .max(50)
//             .default('ModelAnnotation'),
//         downsamplingMethod: z
//             .nativeEnum(DOWNSAMPLING_METHODS)
//             .default(DOWNSAMPLING_METHODS.First),
//     }),
// )
// const form = useForm({
//     validationSchema: formSchema,
// })

// methods
const modelImportButtonOnClick = () => modelFileInputRef.value?.click()
const configImportButtonOnClick = () => configFileInputRef.value?.click()
const onModelFileChange = (e: Event) => {
    try {
        checkImportedFiles(e, modelLoaded)
    } catch (error) {
        handleError(error)
    }

    if (modelFileInputRef.value) {
        resetFileInput(modelFileInputRef.value)
    }
}
const onConfigFileChange = (e: Event) => {
    const file = getFileFromEvent(e)

    if (file && isValidConfigFile(file)) {
        clearModelConfiguration()
        setModelConfiguration(file)
    }

    if (configFileInputRef.value) {
        resetFileInput(configFileInputRef.value)
    }
}
const modelLoaded = (
    _model: LayersModel,
    _modelFileName: string,
    config?: File,
) => {
    model.value = _model
    modelFileName.value = _modelFileName
    selectedAxes.value = []
    if (config) setModelConfiguration(config)
}
const setModelConfiguration = (config: File) => {
    configName.value = config.name
    const reader = new FileReader()
    reader.readAsText(config)
    reader.onload = () => {
        if (typeof reader.result === 'string')
            applyConfig(JSON.parse(reader.result))
    }
}
const applyConfig = (config: {
    downsamplingMethod: DOWNSAMPLING_METHODS
    samplingRate: number
    selectedAxes: Axis[]
    slidingWindow: number
    windowShift: number
}) => {
    slidingWindow.value = config.slidingWindow ?? undefined
    samplingRate.value = config.samplingRate ?? undefined
    windowShift.value = config.windowShift ?? undefined
    selectedDownsamplingMethod.value = config.downsamplingMethod ?? 'First'

    const axes = config.selectedAxes
    if (axes) {
        axes.forEach((axis: { id: number; name: string }) => {
            if (axisExists(axis)) selectedAxes.value.push(axis)
        })
    }
}
const clearModelConfiguration = () => {
    slidingWindow.value = undefined
    samplingRate.value = undefined
    windowShift.value = undefined
    // selectedDownsamplingMethod.value = 'First'
    selectedAxes.value = []
}
const axisExists = (axis: { id: number; name: string }): boolean => {
    return Object.values(store.dataFileSelectedAxes).some(
        (a) => a.id === axis.id && a.name === axis.name,
    )
}
const resetAxisSelection = () => {
    selectedAxes.value = []
}
const resetFileInput = (input: HTMLInputElement) => {
    if (input) input.value = ''
}
// const onSubmit = form.handleSubmit((values) => {
//     console.log('Form submitted!', values)
// })
const onSubmit = async (e: Event) => {
    e.preventDefault()
    loading.value = true

    if (!validateInputs() || !model.value) {
        loading.value = false
        return
    }

    const modelConfig = getModelConfiguration()
    await loadDataIntoModel(modelConfig)
}
const getModelConfiguration = () => ({
    model: model.value!,
    slidingWindow: slidingWindow.value!,
    samplingRate: samplingRate.value!,
    windowShift: windowShift.value!,
    selectedAxes: selectedAxes.value,
    downsamplingMethod: selectedDownsamplingMethod.value,
})
const validateInputs = (): boolean => {
    let invalidFeedback = ''

    if (!model.value) invalidFeedback = 'No Model imported yet!'
    else if (
        slidingWindow.value !== undefined &&
        !isValidNumber(slidingWindow.value)
    )
        invalidFeedback = 'Sliding Window must be a number!'
    else if (slidingWindow.value! < 0)
        invalidFeedback = 'Sliding Window cannot be negative!'
    else if (samplingRate.value! < 0)
        invalidFeedback = 'Sampling Rate cannot be negative!'
    else if (
        windowShift.value !== undefined &&
        !isValidNumber(windowShift.value)
    )
        invalidFeedback = 'Window Shift must be a number!'
    else if (windowShift.value! >= slidingWindow.value!)
        invalidFeedback = 'Window Shift must be less than Sliding Window!'
    else if (windowShift.value! < 0)
        invalidFeedback = 'Window Shift cannot be negative!'
    else if (!isMultiple(slidingWindow.value!, windowShift.value!))
        invalidFeedback = 'Sliding Window must be a multiple of Window Shift!'
    else if (!isMultiple(samplingRate.value! * windowShift.value!, 1))
        invalidFeedback = 'Window Shift * Sampling Rate must be an integer!'
    else if (Object.keys(store.dataFiles).length === 0)
        invalidFeedback = 'Please upload data first!'
    else if (selectedAxes.value.length === 0)
        invalidFeedback = 'At least one Axis must be chosen!'

    if (invalidFeedback) {
        setInvalidFeedback(invalidFeedback)
        return false
    }

    return true
}
const loadDataIntoModel = async (
    modelConfig: ReturnType<typeof getModelConfiguration>,
) => {
    try {
        const instances = createInstances(store, modelConfig)
        if (!instances) return

        const predictedValues = makePredictions(instances, modelConfig.model)
        const annotationId = await createAnnotation(predictedValues)

        if (modelConfig.windowShift > 0) {
            const slotsNumber = predictedValues.length
            const predIndex = 0

            addCompleteResultOverview(
                predictedValues,
                slotsNumber,
                annotationId,
                modelConfig.windowShift,
                predIndex,
            )
        }

        await selectAnnotationFile(annotationId)

        if (!store.isAreasVisible) store.toggleAreasVisibility()
        emit('closeModal')
    } catch (error) {
        handleError(error)
    } finally {
        loading.value = false
    }
}
const addCompleteResultOverview = (
    predictedValues: {
        data: ArrayMap[Rank.R2]
        timestamps: { end: number; start: number }[]
    }[],
    slotsNumber: number,
    annotationId: number,
    windowShift: number,
    predIndex: number,
) => {
    if (!predictedValues.length) return

    let timestamp = predictedValues[0].timestamps[0].start
    const currentPositions = Array(predictedValues.length).fill(0)

    for (let slot = 0; slot < slotsNumber; slot++) {
        const predictionIndex = slot % predictedValues.length
        const currentPosition = currentPositions[predictionIndex]

        if (
            currentPosition === null ||
            currentPosition >= predictedValues[predictionIndex].data.length
        ) {
            currentPositions[predictionIndex] = null
            continue
        }

        const labelFrequency = calculateLabelFrequencies(
            predictedValues,
            currentPositions,
        )
        const mostLikelyLabelId = getMostFrequentLabelId(labelFrequency)

        if (mostLikelyLabelId) {
            database.annotationArea.add({
                annotationId,
                labelId: mostLikelyLabelId,
                timestampFrom: timestamp,
                timestampTo: timestamp + windowShift * 1000,
                yFrom: predIndex,
                yTo: predIndex + 1,
                yAmount: null,
            })
        }

        timestamp += windowShift * 1000
        currentPositions[predictionIndex]! += 1 // Move to the next position
    }
}
const calculateLabelFrequencies = (
    predictedValues: {
        data: ArrayMap[Rank.R2]
    }[],
    currentPositions: (number | null)[],
): Record<number, number> => {
    const labelFrequency: Record<number, number> = {}

    predictedValues.forEach((prediction, i) => {
        const position = currentPositions[i]
        if (position === null) return

        const predictionData = prediction.data[position]
        if (!predictionData || !predictionData.length) return

        const { maxValue, maxIndex } = getMaxValueAndIndex(predictionData)
        if (maxValue > 0) {
            labelFrequency[maxIndex] = (labelFrequency[maxIndex] || 0) + 1
        }
    })

    return labelFrequency
}
const getMostFrequentLabelId = (
    labelFrequency: Record<number, number>,
): number | null => {
    const [mostFrequentLabelId] = Object.keys(labelFrequency).reduce(
        (maxLabel, currentLabelId) => {
            const currentLabelFrequency = labelFrequency[+currentLabelId]
            const maxLabelFrequency = labelFrequency[maxLabel[0]]
            return currentLabelFrequency > maxLabelFrequency
                ? [+currentLabelId, currentLabelFrequency]
                : maxLabel
        },
        [0, 0] as [number, number],
    )

    return mostFrequentLabelId > 0 ? mostFrequentLabelId : null
}
const getMaxValueAndIndex = (
    data: number[],
): { maxValue: number; maxIndex: number } => {
    return data.reduce(
        (acc, value, index) => {
            if (value > acc.maxValue) {
                return { maxValue: value, maxIndex: index }
            }
            return acc
        },
        { maxValue: -Infinity, maxIndex: -1 },
    )
}
const makePredictions = (
    instances: {
        allInstances: {
            dataArray: TensorLike
            timeArray: { start: number; end: number }[]
        }[]
    },
    model: LayersModel,
) => {
    const predictions: {
        data: number[][]
        timestamps: { start: number; end: number }[]
    }[] = []
    const _instances = instances.allInstances

    for (const instance of _instances) {
        const tensor = tf.tensor(instance.dataArray)
        const prediction = model.predict(tensor) as Tensor<Rank.R2>

        if (!Array.isArray(prediction)) {
            predictions.push({
                data: prediction.arraySync(),
                timestamps: instance.timeArray,
            })
        }
    }

    return predictions
}
const createAnnotation = async (
    predictedValues: {
        data: number[][]
        timestamps: { start: number; end: number }[]
    }[],
) => {
    const annotationId = await annotationFileCreate(annotationFileName.value)
    const labelAmount = predictedValues[0].data[0].length

    await annotationLabelsAdd(annotationId, labelAmount)
    await addAreasToDb(predictedValues, annotationId)

    return annotationId
}
const addAreasToDb = async (
    predictedValues: {
        data: number[][]
        timestamps: { start: number; end: number }[]
    }[],
    annotationId: number,
) => {
    const allLabels = await database.annotationLabel
        .where('annotationId')
        .equals(annotationId)
        .toArray()

    for (const prediction of predictedValues) {
        for (let i = 0; i < prediction.data.length; i++) {
            const maxIndex = prediction.data[i].indexOf(
                Math.max(...prediction.data[i]),
            )
            const label = allLabels[maxIndex]

            database.annotationArea.add({
                annotationId,
                labelId: label.id,
                timestampFrom: prediction.timestamps[i].start,
                timestampTo: prediction.timestamps[i].end,
                yFrom: i,
                yTo: i + 1,
                yAmount: predictedValues.length,
            })
        }
    }
}
const handleError = (error: unknown) => {
    if (error instanceof Error) {
        notifyError({ message: error.message })
        setInvalidFeedback(error.message)
    }
}
const setInvalidFeedback = (feedback: string) =>
    emit('setInvalidFeedback', feedback)
const isValidNumber = (value: number): value is number =>
    value !== null && !isNaN(value)
const isMultiple = (a: number, b: number) => {
    // this function is needed, since the normal Javascript modulo seem to not work like expected. With this we only check if the result of division is an float by searching for a comma.
    const temp = (a / b).toString()
    const commaIndex = temp.indexOf('.')
    return commaIndex === -1 ? 0 : commaIndex
}
const isValidConfigFile = (file: File) =>
    file.name.toLowerCase().includes('config') &&
    file.type.toLowerCase().includes('json')
const getFileFromEvent = (e: Event): File | undefined => {
    const target = e.target as HTMLInputElement
    return target.files ? target.files[0] : undefined
}
const prepareConfigDownload = () => {
    const config = {
        slidingWindow: slidingWindow.value,
        samplingRate: samplingRate.value,
        windowShift: windowShift.value,
        downsamplingMethod: selectedDownsamplingMethod.value,
        selectedAxes: selectedAxes.value,
    }
    download({
        data: JSON.stringify(config),
        fileType: 'text/json',
        // { 'text/json': ['.json'] },
        name: 'config.json',
    })
}

// lifecycle
watch(() => props.toggleConfigDownload, prepareConfigDownload)
</script>
