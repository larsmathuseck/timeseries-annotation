import { DateTime } from "luxon";

export function getOption(graphData, timestamps, annotations,  areas, areasVisible, sizeOfGraph, dataZoomStart, dataZoomEnd) {
    let series = [];
    let legende = [];
    let ann;
    let ml;
    let area;
    if (graphData == null) {
        return;
    }
    if(annotations != undefined){
        ann = annotations.map((x, i) => {
            if (x.label) {
                return {
                    symbol: "pin",
                    itemStyle: {
                    color: x.label.color
                    },
                    name: (i + 1).toString() + " " + x.label.name,
                    xAxis: new Date(x.timestamp),
                    y: "75"
                };
            }
        });
        ml = annotations.map(x => {
            if (x.label) {
                return {
                    itemStyle: {
                        color: x.label.color
                    },
                    xAxis: new Date(x.timestamp),
                };
            }
        });
    }
    if (areasVisible && areas != undefined) {
        if (areas.length != 0) {
            area = areas.map(x => {
                if(x.yAmount != null) {
                    return [
                        {
                            xAxis: new Date(x.firstTimestamp),
                            itemStyle: {
                                color: x.label.color,
                                opacity: 0.2,
                                borderColor: "black",
                                borderWidth: 0.5,
                                borderType: "solid"
                            },
                            y: 30 + (((sizeOfGraph - 20)*0.95)/(x.yAmount))*x.y1,
                        },
                        {
                            xAxis: new Date(x.secondTimestamp),
                            y: 30 + (((sizeOfGraph - 20)*0.95)/(x.yAmount))*x.y2,
                        }
                    ];
                }
                else {
                    return [
                        {
                            xAxis: new Date(x.firstTimestamp),
                            itemStyle: {
                                color: x.label.color,
                                opacity: 0.5,
                            },
                            y: 30 + ((sizeOfGraph - 20)*0.95),
                        },
                        {
                            xAxis: new Date(x.secondTimestamp),
                            y: 30 + ((sizeOfGraph - 20)),
                        }
                    ];
                }
                
            });
        }
    }
    for(let key in graphData){
        legende.push(graphData[key].name);
        series.push({
            name: graphData[key].name,
            type: "line",
            showSymbol: false,
            emphasis: {
                scale: false,
                lineStyle: {
                    width: 2,
                    color: graphData[key].color,
                },
            },
            lineStyle: {
                color: graphData[key].color,
                width: 2,
            },
            data: graphData[key].dataPoints,
        });
    }
    series[0].markPoint = {
                        animation: true,
                        symbol: "pin",
                        label: {
                            show: true,
                            padding: 5,
                            distance: 5,
                            formatter: (value) => {
                                return value.name.split(" ")[0];
                            },
                            color: "white"
                        },
                        data: ann,
                    };
    series[0].markLine = {
                        animation: true,
                        silent: true,
                        symbol: "none",
                        label: { show: false},
                        data: ml,
                    };
    series[0].markArea = {
                        animation: true,
                        silent: true,
                        label: { show: false},
                        data: area,
                    };
    return  {
        height: sizeOfGraph,
        animation: false,
        responsive: true,
        maintainAspectRatio: false,
        clip: true,
        sampling: "max",
        series: series,
        tooltip: {
            trigger: "axis",
            formatter: (value) => {
                return DateTime.fromMillis(value[0].axisValue).toFormat('hh:mm:ss SSS');
            }
        },
        legend: {
            data: legende
        },
        xAxis: {
            type: "time",
            data: timestamps,
        },
        yAxis: {
            type: "value",
        },
        grid: {
            left: '20',
            right: '20',
            top: '30',
            containLabel: true
        },
        dataZoom: [
            {
                type: "inside",
                start: dataZoomStart,
                end: dataZoomEnd,
                filterMode: "filter",
            },
            {
                type: "slider",
                animation: true,
                showDataShadow: true,
                filterMode: "filter",
                throttle: 100,
                dataBackground: {
                    lineStyle: {
                        color: "#79bdf2",
                        width: 1.5,
                    },
                    areaStyle: {
                        color: "#ffffff00",
                    },
                },
                height:"100",
                bottom: 0,
                show: true,
                start: dataZoomStart,
                end: dataZoomEnd,
                handleSize: "70%",
                labelFormatter: (value) => {
                    return DateTime.fromMillis(value).toFormat('hh:mm:ss SSS');
                }
            },
        ],
    };
}