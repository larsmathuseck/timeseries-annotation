import { DataFrame } from "danfojs/dist/danfojs-base";
import features from "./ModelFunctions"


export function breakDownToSamplingrate(dataPoints, timestamps, samplingRate, feature) {
    if(!Array.isArray(dataPoints)){
        return [];
    }
    let dataFrames = [];
    dataPoints.forEach(data => {
        let df = new DataFrame(data, {dtypes: ["int32", "float32"]});
        dataFrames.push(df);
    });
    let segments = calcSegements(timestamps, samplingRate);
    let result = [];
    let oldsegment = 0;
    segments[1].forEach(segment => {
        segment = oldsegment + segment;
        let arrayToPush = [];
        dataFrames.forEach(df => {
            let newFrame = df.iloc({rows: [oldsegment.toString() + ":" + segment.toString()]});
            const func = features[feature].func;
            arrayToPush.push(func(newFrame));
        })
        result.push(arrayToPush);
        oldsegment = segment;
    });
    return [segments[0], result];
}

function calcSegements(timestamps, samplingRate){
    let segments = [];
    let segmentTimestamps = [];
    const lastTimestamp = timestamps[timestamps.length -1];
    const samplingWindow = 1000/samplingRate;
    let currentTimestamp = 0;
    let nextTimestamp = timestamps[0] + samplingWindow;
    let counter = 0;
    while(timestamps[currentTimestamp] <= lastTimestamp){
        if(timestamps[currentTimestamp] >= nextTimestamp){
            segments.push(counter);
            segmentTimestamps.push(nextTimestamp - samplingWindow);
            counter = 0;
            nextTimestamp += samplingWindow;
        }
        counter += 1;
        currentTimestamp += 1;
    }
    return [segmentTimestamps, segments];
}

export function createInstances(state, modelConfiguration) {
    const slidingWindow = modelConfiguration.slidingWindow;
    const samplingrate = modelConfiguration.samplingRate;
    const selectedAxes = modelConfiguration.selectedAxes;
    const downsamplingMethod = modelConfiguration.downsamplingMethod;
    const valuesPerInstance = slidingWindow * samplingrate;
    const allAxes = state.data[state.currentSelectedData].dataPoints;
    const timestamps = state.data[state.currentSelectedData].timestamps;
    let windowShift = modelConfiguration.windowShift;
    let allInstances = [];
    let dataPoints = [];
    selectedAxes.forEach(axis => {
        for (let i = 0; i < allAxes.length; i++) {
            if (allAxes[i].id == axis.id) {
                dataPoints.push(allAxes[i].dataPoints);
                break;
            }
        }
    })
    let featureIndex;
    for (let i = 0; i < features.length; i++) {
        if (features[i].name === downsamplingMethod) {
            featureIndex = i;
            break;
        }
    }
    const allSegmentsWithCorrectSampling = breakDownToSamplingrate(dataPoints, timestamps, samplingrate, featureIndex)[1];

    windowShift == 0 ? windowShift = slidingWindow : 'nothing';
    const differentValues = slidingWindow / windowShift;
    for (let i = 0; i < differentValues; i++) {
        let dataArray = [];
        let shift = i * windowShift * samplingrate;
        let segmentStart = shift;
        let segmentEnd = shift + valuesPerInstance;
        while (segmentEnd <= allSegmentsWithCorrectSampling.length) {
            dataArray.push(allSegmentsWithCorrectSampling.slice(segmentStart, segmentEnd));
            segmentStart = segmentEnd;
            segmentEnd += valuesPerInstance;
        }
        allInstances.push(dataArray);
    }
    return allInstances;
}

/* function to get feature instances for supplied data
 * data = data object with all axes
 * selectedFeatures = features with axis data
*/ 
export function createFeatureInstances(data, selectedFeatures, samplingRate){
    let instances = [];
    let dataPoints = [];
    let largestFeatureWindow = 0;
    let smallestFeatureWindow = selectedFeatures[0].slidingWindow;
    // Downsample dataPoints of selected axis
    selectedFeatures.forEach(feature => {
        if(parseFloat(feature.slidingWindow) > largestFeatureWindow){
            largestFeatureWindow = parseFloat(feature.slidingWindow);
        }
        if(parseFloat(feature.slidingWindow) < smallestFeatureWindow){
            smallestFeatureWindow = parseFloat(feature.slidingWindow);
        }
        data.dataPoints.forEach(axis => {
            if(axis.id == feature.axis.id){
                let sampeledData = breakDownToSamplingrate([axis.dataPoints], data.timestamps, samplingRate, 3);
                sampeledData = sampeledData[1].map((x) => { return [sampeledData[0][sampeledData[1].indexOf(x)], x[0]]; });
                dataPoints.push(sampeledData);
            }
        })
    })
    const dataPointsLength = dataPoints[0].length;
    let i = parseInt(largestFeatureWindow*samplingRate);
    // calculate the feature for every slidingWindow and selectedFeature
    while(i < dataPointsLength){
        const result = [];
        for (let j = 0; j < selectedFeatures.length; j++) {
            const feature = selectedFeatures[j];
            const axisData = dataPoints[j];
            result.push(calcFeature(axisData.slice(i - parseInt(feature.slidingWindow*samplingRate), i), feature.feature));
        }
        instances.push(result);
        i = i + parseInt(smallestFeatureWindow*samplingRate);
    }
    let offset = largestFeatureWindow - smallestFeatureWindow;
    offset = offset < 0 ? 0 : offset;
    return([instances, offset, smallestFeatureWindow]);
}

function calcFeature(data, feature){
    let df = new DataFrame(data, {dtypes: ["int32", "float32"]});
    return feature.func(df);
}

