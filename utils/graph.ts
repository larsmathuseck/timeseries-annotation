import type {
    LineSeriesOption,
    MarkAreaOption,
} from 'echarts/types/dist/shared'
import { DateTime } from 'luxon'

interface GraphData {
    color: string
    dataPoints: unknown
    name: string
}

interface Annotation {
    label: {
        color: string
        name: string
    }
    timestamp: number
}

interface Area {
    label: {
        color: string
    }
    timestampFrom: string | number
    timestampTo: string | number
    yAmount: number | null
    yFrom: number | null
    yTo: number | null
}

export const getOption = ({
    annotations,
    areas,
    areasVisible,
    dataZoomEnd,
    dataZoomStart,
    graphData,
    sizeOfGraph,
}: {
    // timestamps: unknown[],
    annotations: Annotation[]
    areas: Area[]
    areasVisible?: boolean
    dataZoomEnd: number
    dataZoomStart: number
    graphData: Record<number, GraphData>
    sizeOfGraph: number
}): ECOption | undefined => {
    if (!graphData) return

    const series = createSeries({
        annotations,
        areas,
        areasVisible,
        graphData,
        sizeOfGraph,
    })
    const legend = createLegend(graphData)

    return {
        height: sizeOfGraph,
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        clip: true,
        sampling: 'max',
        series,
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                if (Array.isArray(params)) {
                    return params
                        .map((param) => {
                            if (param.value) {
                                const timeValue = Array.isArray(param.value)
                                    ? param.value[0]
                                    : param.value
                                return DateTime.fromMillis(
                                    timeValue as number,
                                ).toFormat('HH:mm:ss SSS')
                            }
                            return ''
                        })
                        .join('<br/>')
                }

                if (params.value) {
                    const timeValue = Array.isArray(params.value)
                        ? params.value[0]
                        : params.value
                    return DateTime.fromMillis(timeValue as number).toFormat(
                        'HH:mm:ss SSS',
                    )
                }

                return ''
            },
        },
        legend: { data: legend },
        xAxis: { type: 'time' }, // `data: timestamps` provided by series
        yAxis: { type: 'value' },
        grid: {
            left: '20',
            right: '20',
            top: '30',
            containLabel: true,
        },
        dataZoom: [
            {
                type: 'inside',
                start: dataZoomStart,
                end: dataZoomEnd,
                filterMode: 'filter',
            },
            {
                type: 'slider',
                showDataShadow: true,
                filterMode: 'filter',
                throttle: 100,
                dataBackground: {
                    lineStyle: { color: '#79bdf2', width: 1.5 },
                    areaStyle: { color: '#ffffff00' },
                },
                height: '100',
                bottom: 0,
                show: true,
                start: dataZoomStart,
                end: dataZoomEnd,
                handleSize: '70%',
                labelFormatter: (value: number) =>
                    DateTime.fromMillis(value).toFormat('HH:mm:ss SSS'),
            },
        ],
    }
}

// helper functions

const createSeries = ({
    annotations,
    areas,
    areasVisible,
    graphData,
    sizeOfGraph,
}: {
    annotations: Annotation[]
    areas: Area[]
    areasVisible?: boolean
    graphData: Record<number, GraphData>
    sizeOfGraph: number
}) => {
    const series = Object.values(graphData).map(
        ({ name, color, dataPoints }) =>
            ({
                name,
                type: 'line',
                showSymbol: false,
                emphasis: { disabled: true },
                lineStyle: { color, width: 1.5 },
                data: dataPoints,
                animation: true,
            }) as LineSeriesOption,
    )

    if (series.length > 0) {
        const annotationsData = createAnnotations(annotations)
        const markLineData = createMarkLine(annotations)
        const markAreaData =
            areasVisible && areas
                ? createMarkArea(areas, sizeOfGraph)
                : undefined

        series[0].markPoint = {
            animation: true,
            symbol: 'pin',
            label: {
                show: true,
                padding: 5,
                distance: 5,
                formatter: (value: { name: string }) =>
                    value.name.split(' ')[0],
                color: 'white',
            },
            data: annotationsData,
        }

        series[0].markLine = {
            animation: true,
            silent: true,
            symbol: 'none',
            label: { show: false },
            data: markLineData,
        }

        series[0].markArea = {
            animation: true,
            silent: true,
            label: { show: false },
            data: markAreaData,
        }
    }

    return series
}

const createLegend = (graphData: Record<number, GraphData>): string[] =>
    Object.values(graphData).map(({ name }) => name)

const createAnnotations = (annotations: Annotation[]) =>
    annotations.map((annotation, i) => ({
        symbol: 'pin',
        itemStyle: { color: annotation.label.color },
        name: `${i + 1} ${annotation.label.name}`,
        xAxis: new Date(annotation.timestamp).getTime(),
        y: '75',
    }))

const createMarkLine = (annotations: Annotation[]) =>
    annotations.map((annotation) => ({
        itemStyle: { color: annotation.label.color },
        xAxis: new Date(annotation.timestamp).getTime(),
    }))

const createMarkArea = (
    areas: Area[],
    sizeOfGraph: number,
): MarkAreaOption['data'] =>
    areas.map((area) => {
        const yStart =
            area.yAmount && area.yFrom && area.yTo
                ? 30 + (((sizeOfGraph - 20) * 0.95) / area.yAmount) * area.yFrom
                : 30 + (sizeOfGraph - 20) * 0.95

        const yEnd =
            area.yAmount && area.yFrom && area.yTo
                ? 30 + (((sizeOfGraph - 20) * 0.95) / area.yAmount) * area.yTo
                : 30 + (sizeOfGraph - 20)

        const startPoint = {
            xAxis: new Date(area.timestampFrom).getTime(),
            y: yStart,
            itemStyle: {
                color: area.label.color,
                opacity: area.yAmount ? 0.2 : 0.5,
                borderColor: 'black',
                borderWidth: 0.5,
                borderType: 'solid' as 'solid' | 'dashed' | 'dotted',
            },
        }

        const endPoint = {
            xAxis: new Date(area.timestampTo).getTime(),
            y: yEnd,
        }

        return [startPoint, endPoint]
    })
