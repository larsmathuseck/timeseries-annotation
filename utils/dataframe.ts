import type { DataFrame } from 'danfojs'

export type Feature = {
    id: number
    name: string
    shortName: string
    func: (df: DataFrame) => number
}

const timestampIndex = '0'
const dataIndex = '1'

export const FEATURES: Feature[] = [
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
        name: 'Variance',
        shortName: 'var',
        func: (df: DataFrame) => variance(df),
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

const min = (df: DataFrame) => df[dataIndex].min()

const max = (df: DataFrame) => df[dataIndex].max()

const mean = (df: DataFrame) => df[dataIndex].mean()

const median = (df: DataFrame) => df[dataIndex].median()

const std = (df: DataFrame) => df[dataIndex].std()

const variance = (df: DataFrame) => df[dataIndex].var()

const first = (df: DataFrame) => parseFloat(df.head(1).columns[0][1])

const last = (df: DataFrame) => parseFloat(df.tail(1).columns[0][1])

const slope = (df: DataFrame) => {
    const timestamps: number[] = df[timestampIndex].values as number[]
    const values: number[] = df[dataIndex].values as number[]

    const maxVal = Math.max(...values)
    const minVal = Math.min(...values)

    const maxIdx = values.indexOf(maxVal)
    const minIdx = values.indexOf(minVal)

    const timestampMax = timestamps[maxIdx]
    const timestampMin = timestamps[minIdx]

    if (timestampMax !== timestampMin) {
        return (maxVal - minVal) / (timestampMax - timestampMin)
    }

    return 0
}

export default FEATURES
