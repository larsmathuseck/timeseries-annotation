import { DataFrame } from 'danfojs/dist/danfojs-base'

import { type Feature } from './statistics.js'
import features from './statistics'

// function to convert data to correct samplingrate based on a function set in feature
export const breakDownToSamplingrate = (
    dataPoints: unknown[],
    timestamps: number[],
    samplingRate: number,
    feature: number,
) => {
    if (!Array.isArray(dataPoints)) {
        return {}
    }
    const dataFrames: DataFrame[] = []

    for (const dataPoint of dataPoints) {
        const df = new DataFrame(dataPoint, { dtypes: ['int32', 'float32'] })
        dataFrames.push(df)
    }

    const { segmentTimestamps, segments } = calcSegements(
        timestamps,
        samplingRate,
    )
    const result: (string | number)[][] = []

    let oldsegment = 0
    for (const segment of segments) {
        const _segment = oldsegment + segment
        const arrayToPush: (string | number)[] = []
        dataFrames.forEach((df) => {
            const frameSliced = df.iloc({
                rows: [oldsegment.toString() + ':' + segment.toString()],
            })
            const frameSlicedCasted = frameSliced.asType('1', 'float32')
            const func = features[feature].func
            arrayToPush.push(func(frameSlicedCasted))
        })
        result.push(arrayToPush)
        oldsegment = _segment
    }

    return {
        segmentTimestamps,
        result,
    }
}

/* calculates the amount datapoints that belong together based on the given samplingrate
 * amount of datapoint given as segment with corresponding timestamp
 * timestamp and segment arrays returned
 */
export function calcSegements(
    timestamps: Record<number, number>,
    samplingRate: number,
) {
    const segments = []
    const segmentTimestamps = []
    const lastTimestamp = timestamps[Object.entries(timestamps).length - 1]
    const samplingWindow = 1000 / samplingRate
    let currentTimestamp = 0
    let nextTimestamp = timestamps[0] + samplingWindow
    let counter = 0
    while (timestamps[currentTimestamp] <= lastTimestamp) {
        if (timestamps[currentTimestamp] >= nextTimestamp) {
            segments.push(counter)
            segmentTimestamps.push(nextTimestamp - samplingWindow)
            counter = 0
            nextTimestamp += samplingWindow
        }
        counter += 1
        currentTimestamp += 1
    }
    // Push last Timestamp, so that in case that the last segment ends exactly on the last timestamp, it can be showed correctly in the graph
    segmentTimestamps.push(lastTimestamp)
    return {
        segmentTimestamps,
        segments,
    }
}

/* function to convert data for use in model
 * data = data object with all axes
 * modelConfiguration = configuration object of model
 */
export function createInstances(
    store: ReturnType<typeof useTfAnnotatorStore>,
    modelConfiguration: {
        slidingWindow: number
        samplingRate: number
        selectedAxes: {
            id: number
        }[]
        downsamplingMethod: string
        windowShift: number
    },
) {
    const slidingWindow = modelConfiguration.slidingWindow
    const samplingrate = modelConfiguration.samplingRate
    const selectedAxes = modelConfiguration.selectedAxes
    const downsamplingMethod = modelConfiguration.downsamplingMethod
    const valuesPerInstance = slidingWindow * samplingrate
    const allAxes = store.axesSelected
    const timestamps = store.timestampsSelected
    let windowShift = modelConfiguration.windowShift
    const allInstances: {
        timeArray: {
            end: number
            start: number
        }[]
        dataArray: (string | number)[][][]
    }[] = []
    const dataPoints: unknown[] = []

    selectedAxes.forEach((axis) => {
        dataPoints.push(allAxes[axis.id].dataPoints)
    })
    const featureIndex = getFeatureIndex(downsamplingMethod)
    if (featureIndex === -1) {
        throw new Error(
            "Downsampling Method not found! Can't break down to sampling rate!",
        )
    }
    const { segmentTimestamps, result: segments } = breakDownToSamplingrate(
        dataPoints,
        timestamps,
        samplingrate,
        featureIndex,
    )

    if (!segments || !segmentTimestamps) return

    windowShift = windowShift === 0 ? slidingWindow : windowShift
    const differentValues = slidingWindow / windowShift
    for (let i = 0; i < differentValues; i++) {
        const dataArray: (string | number)[][][] = []
        const timeArray: {
            end: number
            start: number
        }[] = []
        const shift = i * windowShift * samplingrate
        let segmentStart = shift
        let segmentEnd = shift + valuesPerInstance
        while (segmentEnd <= segments.length) {
            dataArray.push(segments.slice(segmentStart, segmentEnd))
            timeArray.push({
                end: segmentTimestamps[segmentEnd],
                start: segmentTimestamps[segmentStart],
            })
            segmentStart = segmentEnd
            segmentEnd += valuesPerInstance
        }
        allInstances.push({ timeArray, dataArray })
    }
    return {
        allInstances,
        segmentsLength: segments.length,
    }
}

/* function to convert data for use in feature model
 * data = data object with all axes
 * selectedFeatures = features with axis data
 */
export function createFeatureInstances(
    data: {
        axes: Record<
            number,
            {
                dataPoints: unknown
                id: unknown
            }
        >
        timestamps: number[]
    },
    selectedFeatures: {
        axis: {
            id: unknown
        }
        feature: Feature
        slidingWindow: string
    }[],
    samplingRate: number,
    downsamplingMethod: string,
) {
    const instances: (string | number)[][] = []
    const dataPoints: (string | number)[][][] = []
    let largestFeatureWindow = 0
    let smallestFeatureWindow = parseFloat(selectedFeatures[0].slidingWindow)
    const featureIndex = getFeatureIndex(downsamplingMethod)

    if (featureIndex === -1) {
        throw new Error(
            "Downsampling Method not found! Can't break down to sampling rate!",
        )
    }

    // Downsample dataPoints of selected axis
    for (const feature of selectedFeatures) {
        if (parseFloat(feature.slidingWindow) > largestFeatureWindow) {
            largestFeatureWindow = parseFloat(feature.slidingWindow)
        }
        if (parseFloat(feature.slidingWindow) < smallestFeatureWindow) {
            smallestFeatureWindow = parseFloat(feature.slidingWindow)
        }
        for (const i in Object.values(data.axes)) {
            const axis = data.axes[i]

            if (axis.id === feature.axis.id) {
                const { segmentTimestamps, result } = breakDownToSamplingrate(
                    [axis.dataPoints],
                    data.timestamps,
                    samplingRate,
                    featureIndex,
                )

                if (!segmentTimestamps || !result) continue

                const _sampeledData = result.map((x) => {
                    return [segmentTimestamps[result.indexOf(x)], x[0]]
                })

                if (!_sampeledData) continue

                dataPoints.push(_sampeledData)
            }
        }
    }

    const dataPointsLength = dataPoints[0].length

    let i = largestFeatureWindow * samplingRate
    // calculate the feature for every slidingWindow and selectedFeature
    while (i < dataPointsLength) {
        const result = []
        for (let j = 0; j < selectedFeatures.length; j++) {
            const feature = selectedFeatures[j]
            const axisData = dataPoints[j]
            result.push(
                calcFeature(
                    axisData.slice(
                        i - parseFloat(feature.slidingWindow) * samplingRate,
                        i,
                    ),
                    feature.feature,
                ),
            )
        }
        instances.push(result)
        i = i + smallestFeatureWindow * samplingRate
    }

    let offset = largestFeatureWindow - smallestFeatureWindow
    offset = offset < 0 ? 0 : offset

    return {
        instances,
        offset,
        smallestFeatureWindow,
    }
}

function calcFeature(data: unknown, feature: Feature) {
    const df = new DataFrame(data, { dtypes: ['int32', 'float32'] })
    return feature.func(df)
}

function getFeatureIndex(featureName: string) {
    let featureIndex
    for (let i = 0; i < features.length; i++) {
        if (features[i].name === featureName) {
            featureIndex = i
            return featureIndex
        }
    }
    return -1
}
