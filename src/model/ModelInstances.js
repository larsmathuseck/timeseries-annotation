import { DataFrame } from "danfojs/dist/danfojs-base";
import features from "./ModelFunctions"

function breakDownToSamplingrate(dataPoints, timestamps, samplingrate, feature) {
    let dataFrames = [];
    dataPoints.forEach(data => {
        let df = new DataFrame(data);
        df = df.asType("1", "float32");
        dataFrames.push(df);
    });
    let segmentlengths = [];
    let timestamp = timestamps[0];
    let timestapplus = timestamp + 1000;
    let i = 0;
    while(i < dataPoints[0].length){
        let dataCount = 0;
        while(timestamp < timestapplus){
            i++;
            dataCount++;
            timestamp = timestamps[i];
        }
        let segmentlength = Math.floor(dataCount / samplingrate);
        let remainder = dataCount % samplingrate;
        for(let i = 0; i < samplingrate; i++) {
            if(remainder > 0) {
                segmentlengths.push(segmentlength + 1);
                remainder--;
            }
            else {
                segmentlengths.push(segmentlength);
            }
        }
        timestapplus = timestamp + 1000;
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
    return result;
}

function createInstances(state, modelConfiguration) {
    const slidingWindow = modelConfiguration.slidingWindow;
    const samplingrate = modelConfiguration.samplingRate;
    const selectedAxes = modelConfiguration.selectedAxes;
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
    const allSegmentsWithCorrectSampling = breakDownToSamplingrate(dataPoints, timestamps, samplingrate, "slope");

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
    console.log(allInstances);
    return allInstances;
}

export default createInstances