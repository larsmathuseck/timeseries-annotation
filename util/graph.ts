import type { ECBasicOption } from 'echarts/types/dist/shared'
import { DateTime } from 'luxon'

export function getOption(
    graphData: Record<
        number,
        {
            color: string
            dataPoints: unknown
            name: string
        }
    >,
    timestamps: unknown,
    annotations: {
        label: {
            color: string
            name: string
        }
        timestamp: number
    }[],
    areas: {
        firstTimestamp: string | number
        label: {
            color: string
        }
        secondTimestamp: string | number
        y1: number | null
        y2: number | null
        yAmount: number | null
    }[],
    areasVisible: unknown,
    sizeOfGraph: number,
    dataZoomStart: unknown,
    dataZoomEnd: unknown,
): ECBasicOption | undefined {
    const series: {
        name: unknown
        type: unknown
        showSymbol: unknown
        emphasis: {
            disabled: unknown
        }
        lineStyle: {
            color: unknown
            width: unknown
        }
        data: unknown
        markPoint?: unknown
        markLine?: unknown
        markArea?: unknown
    }[] = []
    const legend: string[] = []
    let ann
    let ml
    let area

    if (!graphData) return

    if (annotations) {
        ann = annotations.map((x, i) => {
            if (x.label) {
                return {
                    symbol: 'pin',
                    itemStyle: {
                        color: x.label.color,
                    },
                    name: (i + 1).toString() + ' ' + x.label.name,
                    xAxis: new Date(x.timestamp),
                    y: '75',
                }
            }

            return undefined
        })
        ml = annotations.map((x) => {
            if (x.label) {
                return {
                    itemStyle: {
                        color: x.label.color,
                    },
                    xAxis: new Date(x.timestamp),
                }
            }

            return undefined
        })
    }

    if (areasVisible && areas) {
        if (areas.length) {
            area = areas.map((x) => {
                if (x.yAmount && x.y1 && x.y2) {
                    return [
                        {
                            xAxis: new Date(x.firstTimestamp),
                            itemStyle: {
                                color: x.label.color,
                                opacity: 0.2,
                                borderColor: 'black',
                                borderWidth: 0.5,
                                borderType: 'solid',
                            },
                            y:
                                30 +
                                (((sizeOfGraph - 20) * 0.95) / x.yAmount) *
                                    x.y1,
                        },
                        {
                            xAxis: new Date(x.secondTimestamp),
                            y:
                                30 +
                                (((sizeOfGraph - 20) * 0.95) / x.yAmount) *
                                    x.y2,
                        },
                    ]
                } else {
                    return [
                        {
                            xAxis: new Date(x.firstTimestamp),
                            itemStyle: {
                                color: x.label.color,
                                opacity: 0.5,
                            },
                            y: 30 + (sizeOfGraph - 20) * 0.95,
                        },
                        {
                            xAxis: new Date(x.secondTimestamp),
                            y: 30 + (sizeOfGraph - 20),
                        },
                    ]
                }
            })
        }
    }

    for (const key in graphData) {
        legend.push(graphData[key].name)
        series.push({
            name: graphData[key].name,
            type: 'line',
            showSymbol: false,
            emphasis: {
                disabled: true,
            },
            lineStyle: {
                color: graphData[key].color,
                width: 1.5,
            },
            data: graphData[key].dataPoints,
        })
    }

    series[0].markPoint = {
        animation: true,
        symbol: 'pin',
        label: {
            show: true,
            padding: 5,
            distance: 5,
            formatter: (value: { name: string }) => {
                return value.name.split(' ')[0]
            },
            color: 'white',
        },
        data: ann,
    }

    series[0].markLine = {
        animation: true,
        silent: true,
        symbol: 'none',
        label: { show: false },
        data: ml,
    }
    series[0].markArea = {
        animation: true,
        silent: true,
        label: { show: false },
        data: area,
    }

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
            formatter: (value: { axisValue: number }[]) => {
                return DateTime.fromMillis(value[0].axisValue).toFormat(
                    'HH:mm:ss SSS',
                )
            },
        },
        legend: {
            data: legend,
        },
        xAxis: {
            type: 'time',
            data: timestamps,
        },
        yAxis: {
            type: 'value',
        },
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
                animation: true,
                showDataShadow: true,
                filterMode: 'filter',
                throttle: 100,
                dataBackground: {
                    lineStyle: {
                        color: '#79bdf2',
                        width: 1.5,
                    },
                    areaStyle: {
                        color: '#ffffff00',
                    },
                },
                height: '100',
                bottom: 0,
                show: true,
                start: dataZoomStart,
                end: dataZoomEnd,
                handleSize: '70%',
                labelFormatter: (value: number) => {
                    return DateTime.fromMillis(value).toFormat('HH:mm:ss SSS')
                },
            },
        ],
    }

    // return options
}
