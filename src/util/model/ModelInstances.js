import { DataFrame } from "danfojs/dist/danfojs-base";
import features from "./ModelFunctions";


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
            newFrame = newFrame.asType("1", "float32");
            const func = features[feature].func;
            arrayToPush.push(func(newFrame));
        });
        result.push(arrayToPush);
        oldsegment = segment;
    });
    return [segments[0], result];
}

export function breakDownAxisToSamplingrate(data, segments, feature) {
    let df = new DataFrame(data, {dtypes: ["int32", "float32"]});
    let oldsegment = 0;
    let result = [];
    segments[1].forEach(segment => {
        segment = oldsegment + segment;
        let newFrame = df.iloc({rows: [oldsegment.toString() + ":" + segment.toString()]});
        newFrame = newFrame.asType("1", "float32");
        const func = features[feature].func;
        result.push(func(newFrame));
        oldsegment = segment;
    });
    return result;
}

export function calcSegements(timestamps, samplingRate){
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
    // Push last Timestamp, so that in case that the last segment ends exactly on the last timestamp, it can be showed correctly in the graph
    segmentTimestamps.push(lastTimestamp);
    return [segmentTimestamps, segments];
}

export function createInstances(state, modelConfiguration) {
    const slidingWindow = modelConfiguration.slidingWindow;
    const samplingrate = modelConfiguration.samplingRate;
    const selectedAxes = modelConfiguration.selectedAxes;
    const downsamplingMethod = modelConfiguration.downsamplingMethod;
    const valuesPerInstance = slidingWindow * samplingrate;
    console.log(state.data[state.selectedData])
    const allAxes = state.data[state.selectedData].axes;
    const timestamps = state.data[state.selectedData].timestamps;
    let windowShift = modelConfiguration.windowShift;
    let allInstances = [];
    let dataPoints = [];
    console.log(selectedAxes);
    console.log(typeof selectedAxes);
    console.log(selectedAxes.length);
    console.log(allAxes);
    selectedAxes.forEach(axis => {
        console.log(axis);
        console.log(allAxes[axis.id]);
        dataPoints.push(allAxes[axis.id].dataPoints);
        // for (let i = 0; i < allAxes.length; i++) {
        //     if (allAxes[i].id == axis.id) {
        //         dataPoints.push(allAxes[i].dataPoints);
        //         break;
        //     }
        // }
    });
    const featureIndex = getFeatureIndex(downsamplingMethod);
    if (featureIndex == -1) {
        throw new Error("Downsampling Method not found! Can't break down to sampling rate!");
    }
    const allSegmentsWithCorrectSampling = breakDownToSamplingrate(dataPoints, timestamps, samplingrate, featureIndex);
    const segmentTimestamps = allSegmentsWithCorrectSampling[0];
    const segments = allSegmentsWithCorrectSampling[1];
    windowShift = windowShift == 0 ? slidingWindow : windowShift;
    const differentValues = slidingWindow / windowShift;
    for (let i = 0; i < differentValues; i++) {
        let dataArray = [];
        let timeArray = [];
        let shift = i * windowShift * samplingrate;
        let segmentStart = shift;
        let segmentEnd = shift + valuesPerInstance;
        while (segmentEnd <= segments.length) {
            dataArray.push(segments.slice(segmentStart, segmentEnd));
            timeArray.push([segmentTimestamps[segmentStart], segmentTimestamps[segmentEnd]]);
            segmentStart = segmentEnd;
            segmentEnd += valuesPerInstance;
        }
        allInstances.push([timeArray, dataArray]);
    }
    return [allInstances, segments.length];
}

/* function to get feature instances for supplied data
 * data = data object with all axes
 * selectedFeatures = features with axis data
*/ 
export function createFeatureInstances(data, selectedFeatures, samplingRate, downsamplingMethod){
    let instances = [];
    let dataPoints = [];
    let largestFeatureWindow = 0;
    let smallestFeatureWindow = selectedFeatures[0].slidingWindow;
    const featureIndex = getFeatureIndex(downsamplingMethod);
    if (featureIndex == -1) {
        throw new Error("Downsampling Method not found! Can't break down to sampling rate!");
    }
    // Downsample dataPoints of selected axis
    selectedFeatures.forEach(feature => {
        if(parseFloat(feature.slidingWindow) > largestFeatureWindow){
            largestFeatureWindow = parseFloat(feature.slidingWindow);
        }
        if(parseFloat(feature.slidingWindow) < smallestFeatureWindow){
            smallestFeatureWindow = parseFloat(feature.slidingWindow);
        }
        for (const i in Object.values(data.axes)) {
            const axis = data.axes[i];
            if(axis.id == feature.axis.id){
                let sampeledData = breakDownToSamplingrate([axis.dataPoints], data.timestamps, samplingRate, featureIndex);
                sampeledData = sampeledData[1].map((x) => { return [sampeledData[0][sampeledData[1].indexOf(x)], x[0]]; });
                dataPoints.push(sampeledData);
            }
        }
    });
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

function getFeatureIndex(featureName) {
    let featureIndex;
    for (let i = 0; i < features.length; i++) {
        if (features[i].name === featureName) {
            featureIndex = i;
            return featureIndex;
        }
    }
    return -1;
}