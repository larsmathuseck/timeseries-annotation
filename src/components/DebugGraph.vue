<template>
    <div ref="chartDiv" @mouseup="chartClicked" @mousedown="dragDetection">
        <v-chart ref="charts" class="chart" :option="option" @datazoom="zoom"/>
    </div>
</template>

<script>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    ToolboxComponent,
    GridComponent,
    DataZoomComponent,
    MarkLineComponent,
    MarkPointComponent,
    MarkAreaComponent,
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";
import { DateTime } from "luxon";

use([
    CanvasRenderer,
    LineChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    ToolboxComponent,
    DataZoomComponent,
    GridComponent,
    MarkLineComponent,
    MarkPointComponent,
    MarkAreaComponent,
]);

export default {
    name: "DebugGraph",
    components: {
        VChart,
    },
    props: ['data', 'areaData'],
    data: function () {
        return {
            dataZoomStart: 0,
            dataZoomEnd: 100,
            tempDataZoomStart: 0,
            tempDataZoomEnd: 100,
            resize: true,
            sizeOfGraph: 0,
            clickX: 0,
            clickY: 0,
        };
    },
    provide: {
        [THEME_KEY]: "light",
    },
    methods: {
        zoom: function (event) {
            if (event.start !== undefined && event.end !== undefined) {
                this.tempDataZoomStart = event.start;
                this.tempDataZoomEnd = event.end;
            } else if (event.batch !== undefined) {
                this.tempDataZoomStart = event.batch[0].start;
                this.tempDataZoomEnd = event.batch[0].end;
            }
        },
        resizeChart: function () {
            this.$refs.charts?.resize();
        }
    },
    computed: {
        option: function () {
            let series = [];
            let graphData = this.data;
            let legende = [];
            let areas = this.areaData;
            let area;
            if (areas != undefined) {
                if (areas.length != 0) {
                    area = areas.map(x => {
                        return [
                            {
                                xAxis: new Date(x.firstTimestamp),
                                itemStyle: {
                                    color: x.color,
                                    opacity: 0.2,
                                    borderColor: "black",
                                    borderWidth: 1,
                                    borderType: "solid"
                                },
                                y: x.y1 + '%',
                            },
                            {
                                xAxis: new Date(x.secondTimestamp),
                                y: x.y2 + '%',
                            }
                        ];
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
            series[0].markArea = {
                                animation: true,
                                silent: true,
                                label: { show: false},
                                data: area,
                            }
            return {
                height: this.sizeOfGraph,
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
                    data: this.$store.getters.timestamps,
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
                        start: this.dataZoomStart,
                        end: this.dataZoomEnd,
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
                        start: this.dataZoomStart,
                        end: this.dataZoomEnd,
                        handleSize: "70%",
                        labelFormatter: (value) => {
                            return DateTime.fromMillis(value).toFormat('hh:mm:ss SSS');
                        }
                    },
                ],
            };
        },
    },
    watch:{
        option: function(){
            this.$refs.charts?.clear();
            this.dataZoomStart = this.tempDataZoomStart;
            this.dataZoomEnd = this.tempDataZoomEnd;
            this.sizeOfGraph = this.$refs.charts?.getHeight() - 140;
        }
    },
    created: function(){
        this.sizeOfGraph = this.$refs.charts?.getHeight() - 140;
        window.addEventListener("resize", () => {
            this.resizeChart();
            this.sizeOfGraph = this.$refs.charts?.getHeight() - 140;
        })
    }
}

</script>

<style scoped>

.chart {
    height: 100%;
    padding-bottom: 20px;
}

</style>
