
const features = [
    {id: 0, name: "Minimum", func: (df) => min(df)},
    {id: 1, name: "Maximum", func: (df) => max(df)},
    {id: 2, name: "Mean", func: (df) => mean(df)},
    {id: 3, name: "Median", func: (df) => median(df)},
    {id: 4, name: "Standard Deviation", func: (df) => std(df)},
    {id: 5, name: "Varianz", func: (df) => varianz(df)},
    {id: 6, name: "Slope", func: (df) => slope(df)},
]

function min(df){
    return df.min({ axis: 0 }).values[1];
}

function max(df){
    return df.max({ axis: 0 }).values[1];
}

function mean(df){
    return df.mean({ axis: 0 }).values[1];
}

function median(df){
    return df.median({ axis: 0 }).values[1];
}

function std(df){
    return df.std({ axis: 0 }).values[1];
}

function varianz(df){
    return df.var({ axis: 0 }).values[1];
}

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

export default features;
// function testDanfo() {
//     const samplingrate = 8;
//     const data = state.data[0].dataPoints[0].dataPoints;
//     let df = new DataFrame(data);
//     //df.drop({ columns: ["0"], inplace: true })
//     df = df.asType("1", "float32");
//     const timestamps = state.data[0].timestamps;
//     let segmentlengths = [];
//     let timestamp = timestamps[0];
//     let timestapplus = timestamp + 1000;
//     let i = 0;
//     while(i < data.length){
//         let dataCount = 0;
//         while(timestamp < timestapplus){
//             i++;
//             dataCount++;
//             timestamp = timestamps[i];
//         }
//         let segmentlength = Math.floor(dataCount / samplingrate);
//         let remainder = dataCount % samplingrate;
//         for(let i = 0; i < samplingrate; i++){
//             if(remainder > 0){
//                 segmentlengths.push(segmentlength + 1);
//                 remainder--;
//             }
//             else{
//                 segmentlengths.push(segmentlength);
//             }
//         }
//         timestapplus = timestamp + 1000;
//     }
//     let max = [];
//     let min = [];
//     let mean = [];
//     let median = [];
//     let std = [];
//     let varianz = [];
//     let slopes = [];
//     let oldsegment = 0;
//     segmentlengths.forEach(segment => {
//         segment = oldsegment + segment;
//         let newFrame = df.iloc({rows: [oldsegment.toString() + ":" + segment.toString()]});
//         max.push([timestamps[segment], newFrame.max({ axis: 0 }).values[1]]);
//         min.push([timestamps[segment], newFrame.min({ axis: 0 }).values[1]]);
//         mean.push([timestamps[segment], newFrame.mean({ axis: 0 }).values[1]]);
//         median.push([timestamps[segment], newFrame.median({ axis: 0 }).values[1]]);
//         std.push([timestamps[segment], newFrame.std({ axis: 0 }).values[1]]);
//         varianz.push([timestamps[segment], newFrame.var({ axis: 0 }).values[1]]);
//         const slopeArray = slope(newFrame);
//         // console.log(slopeArray)
//         slopes.push([slopeArray[0], slopeArray[1]]);
//         oldsegment = segment;
//     })
//     state.data[0].dataPoints.push({
//         id: "max",
//         name: "Max",
//         dataPoints: max,
//         color: "black",
//     });
//     state.data[0].dataPoints.push({
//         id: "min",
//         name: "Min",
//         dataPoints: min,
//         color: "green",
//     });
//     state.data[0].dataPoints.push({
//         id: "mean",
//         name: "Mean",
//         dataPoints: mean,
//         color: "blue",
//     });
//     state.data[0].dataPoints.push({
//         id: "median",
//         name: "Median",
//         dataPoints: median,
//         color: "orange",
//     });
//     state.data[0].dataPoints.push({
//         id: "std",
//         name: "Std",
//         dataPoints: std,
//         color: "red",
//     });
//     state.data[0].dataPoints.push({
//         id: "var",
//         name: "Var",
//         dataPoints: varianz,
//         color: "brown",
//     });
//     state.data[0].dataPoints.push({
//         id: "slope",
//         name: "Slope",
//         dataPoints: slopes,
//         color: "purple",
//     });
//     state.data[0].selectedAxes.push("max");
//     state.data[0].selectedAxes.push("min");
//     state.data[0].selectedAxes.push("mean");
//     state.data[0].selectedAxes.push("median");
//     state.data[0].selectedAxes.push("std");
//     state.data[0].selectedAxes.push("var");
//     state.data[0].selectedAxes.push("slope");
//     console.log(state.data[0]);
// }