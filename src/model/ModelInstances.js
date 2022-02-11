import { DataFrame } from "danfojs/dist/danfojs-base";
import features from "./ModelFunctions"

export function breakDownToSamplingrate(dataPoints, timestamps, samplingrate, feature) {
    if(!Array.isArray(dataPoints)){
        return [];
    }
    let dataFrames = [];
    dataPoints.forEach(data => {
        let df = new DataFrame(data);
        df = df.asType("1", "float32");
        dataFrames.push(df);
    });
    let segmentlengths = [];
    let timestamp = timestamps[0];
    let timestampForPoint = timestamps[0] + (1000/samplingrate/2);
    let nextSecond;
    let i = 0;
    let newTimestamps = [];
    while(i < dataPoints[0].length){
        let dataCount = 0;
        nextSecond = timestamp + 1000;
        if(nextSecond < timestamps[timestamps.length-1]){
            while(timestamps[i] < nextSecond){
                i++;
                dataCount++;
            }
            let segmentlength = Math.floor(dataCount / samplingrate);
            let remainder = dataCount % samplingrate;
            for(let i = 0; i < samplingrate; i++) {
                newTimestamps.push(timestampForPoint + i * (1000/samplingrate));
                if(remainder > 0) {
                    segmentlengths.push(segmentlength + 1);
                    remainder--;
                }
                else {
                    segmentlengths.push(segmentlength);
                }
            }
            timestamp = nextSecond;
            timestampForPoint += 1000;
        }
        else{
            break;
        }
    }
    let result = [];
    let oldsegment = 0;
    segmentlengths.forEach(segment => {
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
    return [result, newTimestamps];
}

export function createInstances(state, modelConfiguration, feature) {
    const slidingWindow = modelConfiguration.slidingWindow;
    const samplingrate = modelConfiguration.samplingRate;
    const selectedAxes = modelConfiguration.selectedAxes;
    const feature = modelConfiguration.feature;
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
        if (features[i].id === feature.id) {
            featureIndex = i;
            break;
        }
    }
    const allSegmentsWithCorrectSampling = breakDownToSamplingrate(dataPoints, timestamps, samplingrate, featureIndex)[0];

    windowShift == 0 ? windowShift = slidingWindow : 'nothing';
    const differentValues = slidingWindow / windowShift;
    for (let i = 0; i < differentValues; i++) {
        let dataArray = [];
        let shift = i * windowShift * samplingrate;
        let segmentStart = shift;
        let segmentEnd = shift + valuesPerInstance;
        if(selectedAxes.length > 1){
            while (segmentEnd <= allSegmentsWithCorrectSampling.length) {
                dataArray.push(allSegmentsWithCorrectSampling.slice(segmentStart, segmentEnd));
                segmentStart = segmentEnd;
                segmentEnd += valuesPerInstance;
            }
            allInstances.push(dataArray);
        }
        else{
            while (segmentEnd <= allSegmentsWithCorrectSampling.length) {
                allInstances.push(allSegmentsWithCorrectSampling.slice(segmentStart, segmentEnd));
                segmentStart = segmentEnd;
                segmentEnd += valuesPerInstance;
            }
        }
        
    }
    return allInstances;
}