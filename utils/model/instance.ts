import { DataFrame } from 'danfojs/dist/danfojs-base'

export const breakDownToSamplingrate = ({
    dataPoints,
    timestamps,
    samplingRate,
    featureIndex,
}: {
    dataPoints: number[][][]
    timestamps: readonly number[]
    samplingRate: number
    featureIndex: number
}) => {
    const dataFrames = dataPoints.map(
        (dataPoint) =>
            new DataFrame(dataPoint, { dtypes: ['int32', 'float32'] }),
    )

    const { segmentTimestamps, segments } = calcSegments(
        timestamps,
        samplingRate,
    )
    const result: number[][] = []

    let oldSegment = 0
    for (const segment of segments) {
        const nextSegment = oldSegment + segment
        const arrayToPush: number[] = []

        for (const df of dataFrames) {
            const frameSliced = df.iloc({ rows: [`${oldSegment}:${segment}`] })
            const frameSlicedCasted = frameSliced.asType('1', 'float32')
            const func = FEATURES[featureIndex].func
            arrayToPush.push(func(frameSlicedCasted))
        }

        result.push(arrayToPush)
        oldSegment = nextSegment
    }

    return {
        segmentTimestamps,
        result,
    }
}

export function calcSegments(
    timestamps: readonly number[],
    samplingRate: number,
) {
    const segments: number[] = []
    const segmentTimestamps: number[] = []

    const lastTimestamp = timestamps[timestamps.length - 1]
    const samplingWindow = 1000 / samplingRate
    let nextTimestamp = timestamps[0] + samplingWindow
    let counter = 0

    timestamps.forEach((currentTimestamp) => {
        if (currentTimestamp >= nextTimestamp) {
            segments.push(counter)
            segmentTimestamps.push(nextTimestamp - samplingWindow)
            counter = 0
            nextTimestamp += samplingWindow
        }
        counter += 1
    })

    segmentTimestamps.push(lastTimestamp)

    return { segmentTimestamps, segments }
}

export function createInstances(
    store: ReturnType<typeof useTfaStore>,
    modelConfig: {
        slidingWindow: number
        samplingRate: number
        selectedAxes: { id: number }[]
        downsamplingMethod: string
        windowShift: number
    },
) {
    const {
        slidingWindow,
        samplingRate,
        selectedAxes,
        downsamplingMethod,
        windowShift,
    } = modelConfig
    const valuesPerInstance = slidingWindow * samplingRate

    const allAxes = store.dataFileSelectedAxes
    const timestamps = store.dataFileSelectedTimestamps

    const dataPoints = selectedAxes.map((axis) => allAxes[axis.id].dataPoints)

    const featureIndex = getFeatureIndex(downsamplingMethod)
    if (featureIndex === -1) throw new Error('Downsampling Method not found!')

    const { segmentTimestamps, result: segments } = breakDownToSamplingrate({
        dataPoints,
        timestamps,
        samplingRate,
        featureIndex,
    })
    if (!segments || !segmentTimestamps) return

    const adjustedWindowShift = windowShift || slidingWindow
    const numberOfWindows = slidingWindow / adjustedWindowShift
    const allInstances = []

    for (let i = 0; i < numberOfWindows; i++) {
        const shift = i * adjustedWindowShift * samplingRate
        let segmentStart = shift
        let segmentEnd = shift + valuesPerInstance

        const timeArray = []
        const dataArray = []

        while (segmentEnd <= segments.length) {
            dataArray.push(segments.slice(segmentStart, segmentEnd))
            timeArray.push({
                start: segmentTimestamps[segmentStart],
                end: segmentTimestamps[segmentEnd],
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

export function createFeatureInstances(
    data: DataFile,
    selectedFeatures: {
        axis: { id: number }
        feature: Feature
        slidingWindow: number
    }[],
    samplingRate: number,
    downsamplingMethod: string,
) {
    const instances: number[][] = []
    const dataPoints: number[][][] = []
    let largestFeatureWindow = 0
    let smallestFeatureWindow = selectedFeatures[0].slidingWindow

    const featureIndex = getFeatureIndex(downsamplingMethod)
    if (featureIndex === -1) throw new Error('Downsampling Method not found!')

    selectedFeatures.forEach((feature) => {
        const windowSize = feature.slidingWindow
        largestFeatureWindow = Math.max(largestFeatureWindow, windowSize)
        smallestFeatureWindow = Math.min(smallestFeatureWindow, windowSize)

        const axisData = data.axes[feature.axis.id].dataPoints
        const { segmentTimestamps, result } = breakDownToSamplingrate({
            dataPoints: [axisData],
            timestamps: data.timestamps,
            samplingRate,
            featureIndex,
        })

        if (result && segmentTimestamps) {
            const sampledData = result.map((x, idx) => [
                segmentTimestamps[idx],
                x[0],
            ])
            dataPoints.push(sampledData)
        }
    })

    let i = largestFeatureWindow * samplingRate
    const dataPointsLength = dataPoints[0]?.length || 0

    while (i < dataPointsLength) {
        const result = selectedFeatures.map((feature, idx) => {
            const axisData = dataPoints[idx]
            const windowStart = i - feature.slidingWindow * samplingRate
            return calcFeature(axisData.slice(windowStart, i), feature.feature)
        })

        instances.push(result)
        i += smallestFeatureWindow * samplingRate
    }

    const offset = Math.max(0, largestFeatureWindow - smallestFeatureWindow)

    return { instances, offset, smallestFeatureWindow }
}

function calcFeature(data: number[][], feature: Feature) {
    const df = new DataFrame(data, { dtypes: ['int32', 'float32'] })
    return feature.func(df)
}

const getFeatureIndex = (featureName: string) =>
    FEATURES.findIndex((feature) => feature.name === featureName)
