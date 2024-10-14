import { DataFrame } from 'danfojs'

export type Feature = {
    id: number
    name: string
    shortName: string
    func: (df: DataFrame) => string | number
}

// array of all features, add new features here
const features: Feature[] = [
    {
        id: 0,
        name: 'Minimum',
        shortName: 'min',
        func: (df: DataFrame) => min(df),
    },
    {
        id: 1,
        name: 'Maximum',
        shortName: 'max',
        func: (df: DataFrame) => max(df),
    },
    {
        id: 2,
        name: 'Mean',
        shortName: 'mean',
        func: (df: DataFrame) => mean(df),
    },
    {
        id: 3,
        name: 'Median',
        shortName: 'median',
        func: (df: DataFrame) => median(df),
    },
    {
        id: 4,
        name: 'Standard Deviation',
        shortName: 'std',
        func: (df: DataFrame) => std(df),
    },
    {
        id: 5,
        name: 'Varianz',
        shortName: 'var',
        func: (df: DataFrame) => varianz(df),
    },
    {
        id: 6,
        name: 'Slope',
        shortName: 'slp',
        func: (df: DataFrame) => slope(df),
    },
    {
        id: 7,
        name: 'First',
        shortName: 'first',
        func: (df: DataFrame) => first(df),
    },
    {
        id: 8,
        name: 'Last',
        shortName: 'last',
        func: (df: DataFrame) => last(df),
    },
]

// df = dataframe with 0: timestamp, 1:data
function min(df: DataFrame) {
    return df.min().columns[1]
}

function max(df: DataFrame) {
    return df.max().columns[1]
}

function mean(df: DataFrame) {
    return df.mean().columns[1]
}

function median(df: DataFrame) {
    return df.median().columns[1]
}

function std(df: DataFrame) {
    return df.std().columns[1]
}

function varianz(df: DataFrame) {
    return df.var().columns[1]
}

function first(df: DataFrame) {
    return parseFloat(df.head(1).columns[0][1])
}

function last(df: DataFrame) {
    return parseFloat(df.tail(1).columns[0][1])
}

function slope(df: DataFrame) {
    let max = parseInt(df.columns[0][1])
    let timestampMax = parseInt(df.columns[0][0])
    let min = parseInt(df.columns[0][1])
    let timestampMin = parseInt(df.columns[0][0])
    const values = df.columns
    for (let i = 1; i < values.length; i++) {
        if (parseInt(values[i][1]) > max) {
            max = parseInt(values[i][1])
            timestampMax = parseInt(values[i][0])
        }
        if (parseInt(values[i][1]) < min) {
            min = parseInt(values[i][1])
            timestampMin = parseInt(values[i][0])
        }
    }
    let slope = 0
    if (timestampMax !== timestampMin) {
        slope = (max - min) / (timestampMax - timestampMin)
    }
    return slope
}

export default features
