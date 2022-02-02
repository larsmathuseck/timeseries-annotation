import { DataFrame } from "danfojs";

function slope(df) {
    let max = df.values[0][1];
    let timestampMax = df.values[0][0];
    let min = df.values[0][1];
    let timestampMin = df.values[0][0];
    const values = df.values;
    for (let i = 1; i < values.length; i++) {
        if (values[i][1] > max) {
            max = values[i][1];
            timestampMax = values[i][0];
        }
        if (values[i][1] < min) {
            min = values[i][1];
            timestampMin = values[i][0];
        }
    }
    let slope = 0;
    if (timestampMax != timestampMin) {
        slope = (max - min) / (timestampMax - timestampMin);
    }
    return [timestampMax, slope];
}

function breakDownToSamplingrate(data, timestamps, samplingrate) {
    let df = new DataFrame(data);
    //df.drop({ columns: ["0"], inplace: true })
    df = df.asType("1", "float32");
    let segmentlengths = [];
    let timestamp = timestamps[0];
    let timestapplus = timestamp + 1000;
    let i = 0;
    while(i < data.length){
        let dataCount = 0;
        while(timestamp < timestapplus){
            i++;
            dataCount++;
            timestamp = timestamps[i];
        }
        let segmentlength = Math.floor(dataCount / samplingrate);
        let remainder = dataCount % samplingrate;
        for(let i = 0; i < samplingrate; i++){
            if(remainder > 0){
                segmentlengths.push(segmentlength + 1);
                remainder--;
            }
            else{
                segmentlengths.push(segmentlength);
            }
        }
        timestapplus = timestamp + 1000;
    }
    let slopes = [];
    let oldsegment = 0;
    segmentlengths.forEach(segment => {
        segment = oldsegment + segment;
        let newFrame = df.iloc({rows: [oldsegment.toString() + ":" + segment.toString()]});
        const slopeArray = slope(newFrame);
        slopes.push(slopeArray[1]);
        oldsegment = segment;
    });
    return slopes;
}
function createInstances(state, modelConfiguration) {
    const slidingWindow = modelConfiguration.slidingWindow;
    const samplingrate = modelConfiguration.samplingRate;
    const selectedAxes = modelConfiguration.selectedAxes;
    const valuesPerInstance = slidingWindow * samplingrate;
    const allAxes = state.data[state.currentSelectedData].dataPoints;
    const timestamps = state.data[state.currentSelectedData].timestamps;
    let allSegmentsWithCorrectSampling = []
    let allInstances = [];
    // get slope or max,min etc in correct samplingrate for each selected axis
    selectedAxes.forEach(axis => {
        let dataPoints;
        for (let i = 0; i < allAxes.length; i++) {
            if (allAxes[i].id == axis.id) {
                dataPoints = allAxes[i].dataPoints
                break;
            }
        }
        const segment = breakDownToSamplingrate(dataPoints, timestamps, samplingrate);
        allSegmentsWithCorrectSampling.push(segment);
    });

    // put all those data in the segments of each axis into correct arrays considering the sliding window. Each instance is an array 
    const segmentLengths = allSegmentsWithCorrectSampling[0].length;
    const n = segmentLengths / valuesPerInstance; // n = number of instances that will be classified
    let currentValueIndex = 0;
    for (let i = 0; i < n; i++) {
        let instance = []
        for (let j = 0; j < valuesPerInstance; j++) {
            let arrayToPush = [];
            for (let k = 0; k < allSegmentsWithCorrectSampling.length; k++) {
                arrayToPush.push(allSegmentsWithCorrectSampling[k][currentValueIndex]);
            }
            currentValueIndex ++;
            instance.push(arrayToPush);
        }
        allInstances.push(instance);
    }
    return allInstances;
}

export default createInstances