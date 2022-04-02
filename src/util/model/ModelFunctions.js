
// array of all features, add new features here
const features = [
    {id: 0, name: "Minimum", shortName: "min", func: (df) => min(df)},
    {id: 1, name: "Maximum", shortName: "max", func: (df) => max(df)},
    {id: 2, name: "Mean", shortName: "mean", func: (df) => mean(df)},
    {id: 3, name: "Median", shortName: "median", func: (df) => median(df)},
    {id: 4, name: "Standard Deviation", shortName: "std", func: (df) => std(df)},
    {id: 5, name: "Varianz", shortName: "var", func: (df) => varianz(df)},
    {id: 6, name: "Slope", shortName: "slp", func: (df) => slope(df)},
    {id: 7, name: "First", shortName: "first", func: (df) => first(df)},
    {id: 8, name: "Last", shortName: "last", func: (df) => last(df)},
];

// df = dataframe with 0: timestamp, 1:data
function min(df) {
    return df.min({ axis: 0 }).values[1];
}

function max(df) {
    return df.max({ axis: 0 }).values[1];
}

function mean(df) {
    return df.mean({ axis: 0 }).values[1];
}

function median(df) {
    return df.median({ axis: 0 }).values[1];
}

function std(df) {
    return df.std({ axis: 0 }).values[1];
}

function varianz(df) {
    return df.var({ axis: 0 }).values[1];
}

function first(df) {
    return parseFloat(df.head(1).values[0][1]);
}

function last(df) {
    return parseFloat(df.tail(1).values[0][1]);
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