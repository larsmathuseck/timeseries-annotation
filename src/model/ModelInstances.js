import { DataFrame } from "danfojs/dist/danfojs-base";
import features from "./ModelFunctions"

export function breakDownToSamplingrate(dataPoints, timestamps, samplingRate, feature) {
    if(!Array.isArray(dataPoints)){
        return [];
    }
    let dataFrames = [];
    dataPoints.forEach(data => {
        let df = new DataFrame(data);
        df = df.asType("1", "float32");
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
    let newTimestmaps = [];
    let timestamp = timestamps[0];
    let timestampForPoint = timestamps[0] + Math.floor(1000/samplingRate/2);
    let nextSecond;
    let i = 0;
    while(i < timestamps.length){
        let dataCount = 0;
        nextSecond = timestamp + 1000;
        if(nextSecond < timestamps[timestamps.length-1]){
            while(timestamps[i] < nextSecond){
                i++;
                dataCount++;
            }
            let segmentlength = Math.floor(dataCount / samplingRate);
            let remainder = dataCount % samplingRate;
            for(let i = 0; i < samplingRate; i++) {
                newTimestmaps.push(timestampForPoint + i * (Math.floor(1000/samplingRate)));
                if(remainder > 0) {
                    segments.push(segmentlength + 1);
                    remainder--;
                }
                else {
                    segments.push(segmentlength);
                }
            }
            timestamp = nextSecond;
            timestampForPoint += 1000;
        }
        else{
            break;
        }
    }
    return [newTimestmaps, segments];
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
export function createFeatureInstances(data, selectedFeatures, slidingWindow, samplingRate){
    let instances = [];
    let dataPoints = [];
    let largestFeatureWindow = 0;
    // Downsample dataPoints of selected axis
    selectedFeatures.forEach(feature => {
        if(parseInt(feature.dataPointsPerInstance) > largestFeatureWindow){
            largestFeatureWindow = parseInt(feature.dataPointsPerInstance);
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
    let i = parseInt(largestFeatureWindow);
    // calculate the feature for every slidingWindow and selectedFeature
    while(i < dataPointsLength){
        const result = [];
        selectedFeatures.forEach((feature) => {
            const axisData = dataPoints[feature.id];
            result.push(calcFeature(axisData.slice(i - parseInt(feature.dataPointsPerInstance), i), feature.feature));
        });
        instances.push(result);
        i = i + parseInt(slidingWindow*samplingRate);
    }
    let offset = largestFeatureWindow/samplingRate - slidingWindow;
    offset = offset < 0 ? 0 : offset;
    return([instances, offset]);
}

function calcFeature(data, feature){
    let df = new DataFrame(data);
    df = df.asType("1", "float32");
    return feature.func(df);
}

