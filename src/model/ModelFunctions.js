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
    return slope;
}

function breakDownToSamplingrate(dataPoints, timestamps, samplingrate) {
    let dataFrames = [];
    dataPoints.forEach(data => {
        let df = new DataFrame(data);
        //df.drop({ columns: ["0"], inplace: true })
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
    let slopes = [];
    let allTimestamps = [];
    let oldsegment = 0;
    segmentlengths.forEach(segment => {
        segment = oldsegment + segment;
        let arrayToPush = [];
        dataFrames.forEach(df => {
            let newFrame = df.iloc({rows: [oldsegment.toString() + ":" + segment.toString()]});
            arrayToPush.push(slope(newFrame));
        })
        slopes.push(arrayToPush);
        const firstTimestamp = timestamps[oldsegment];
        let secondTimestamp = timestamps[segment];
        secondTimestamp == undefined ? secondTimestamp = timestamps.slice(-1)[0] : 'nothing';
        allTimestamps.push([firstTimestamp, secondTimestamp]);
        oldsegment = segment;
    });
    return [slopes, allTimestamps];
}

function createInstances(state, modelConfiguration) {
    const slidingWindow = modelConfiguration.slidingWindow;
    const samplingrate = modelConfiguration.samplingRate;
    const selectedAxes = modelConfiguration.selectedAxes;
    let windowShift = modelConfiguration.windowShift;
    const valuesPerInstance = slidingWindow * samplingrate;
    const allAxes = state.data[state.currentSelectedData].dataPoints;
    const timestamps = state.data[state.currentSelectedData].timestamps;
    let allInstances = [];
    // get slope or max,min etc in correct samplingrate for each selected axis
    // selectedAxes.forEach(axis => {
    //     let dataPoints;
    //     for (let i = 0; i < allAxes.length; i++) {
    //         if (allAxes[i].id == axis.id) {
    //             dataPoints = allAxes[i].dataPoints
    //             break;
    //         }
    //     }
    //     const result = breakDownToSamplingrate(dataPoints, timestamps, samplingrate, slidingWindow, windowShift);
    //     // console.log("breakdonw result:", result);
    //     allSegmentsWithCorrectSampling.push(result[0]);
    //     allTimestamps.push(result[1]);
    // });
    let dataPoints = [];
    selectedAxes.forEach(axis => {
        for (let i = 0; i < allAxes.length; i++) {
            if (allAxes[i].id == axis.id) {
                dataPoints.push(allAxes[i].dataPoints);
                break;
            }
        }
    })
    const result = breakDownToSamplingrate(dataPoints, timestamps, samplingrate);
    const allSegmentsWithCorrectSampling = result[0];
    const allTimestamps = result[1];

    console.log(allSegmentsWithCorrectSampling);
    console.log(allTimestamps);

    windowShift == 0 ? windowShift = slidingWindow : 'nothing';
    const differentValues = slidingWindow / windowShift;
    let array = [];
    for (let i = 0; i < differentValues; i++) {
        let tempArray = [];
        let shift = i * windowShift * samplingrate;
        let segmentStart = shift;
        let segmentEnd = shift + valuesPerInstance;
        while (segmentEnd <= allSegmentsWithCorrectSampling.length) {
            tempArray.push(allSegmentsWithCorrectSampling.slice(segmentStart, segmentEnd));
            segmentStart = segmentEnd;
            segmentEnd += valuesPerInstance;
        }
        array.push(tempArray);
    }
    console.log(array);


    // console.log("allTimestamps that come with slope: ", allTimestamps);

    // put all those data in the segments of each axis into correct arrays considering the sliding window. Each instance is an array 
    const segmentLengths = allSegmentsWithCorrectSampling[0].length;
    const n = segmentLengths / valuesPerInstance; // n = number of instances that will be classified
    let currentValueIndex = 0;
    let timestampsPerInstance = [];
    for (let i = 0; i < n; i++) {
        let instance = []
        // console.log("iteration: ", i);
        // console.log("looking at timestamps: ", allTimestamps[0][currentValueIndex]);
        const firstTimestamp = allTimestamps[0][currentValueIndex][0]
        for (let j = 0; j < valuesPerInstance; j++) {
            let arrayToPush = [];
            for (let k = 0; k < allSegmentsWithCorrectSampling.length; k++) {
                arrayToPush.push(allSegmentsWithCorrectSampling[k][currentValueIndex]);
            }
            currentValueIndex ++;
            instance.push(arrayToPush);
        }
        // console.log(currentValueIndex);
        allInstances.push(instance);
        // console.log("looking at timestamps: ", allTimestamps[0][currentValueIndex - 1]);
        let secondTimestamp;
        if (allTimestamps[0][currentValueIndex - 1]) {
            secondTimestamp = allTimestamps[0][currentValueIndex -1 ][1];
        } else {
            console.log(allTimestamps[0].slice(-1));
            secondTimestamp = allTimestamps[0].slice(-1)[0][1];
        }
        timestampsPerInstance.push([firstTimestamp, secondTimestamp]);
    }
    return [allInstances, timestampsPerInstance];
}

export default createInstances