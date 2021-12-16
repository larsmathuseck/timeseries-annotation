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
]);

export default {
    name: "Graph",
    components: {
        VChart,
    },
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
        chartClicked: function (event) {
            const diffX = Math.abs(event.pageX - this.clickX);
            const diffY = Math.abs(event.pageY - this.clickY);
            if(diffX < 3 && diffY < 3){
                let pointInPixel = [event.offsetX, event.offsetY];
                if (this.$refs.charts.containPixel("grid", pointInPixel)) {
                    let pointInGrid = this.$refs.charts.convertFromPixel("grid", pointInPixel);
                    this.$store.commit("addAnnotationPoint", Math.round(pointInGrid[0]));
                }
            }
        },
        dragDetection: function (event) {
            this.clickX = event.pageX;
            this.clickY = event.pageY;
        },
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
            let graphData = this.$store.getters.getData;
            let legende = [];
            let annotations = this.$store.getters.getAnnotations;
            let ann = annotations.map((x, i) => {
                return {
                    symbol: "pin",
                    itemStyle: {
                    color: x.color
                    },
                    name: (i + 1).toString() + " " + x.name,
                    xAxis: new Date(x.timestamp),
                    y: "75"
                };
            });
            let ml = annotations.map(x => {
                return {
                    itemStyle: {
                        color: x.color
                    },
                    xAxis: new Date(x.timestamp),
                };
            });
            for(let key in graphData){
                legende.push(graphData[key].name);
                series.push({
                    name: graphData[key].name,
                    type: "line",
                    showSymbol: false,
                    emphasis: {
                        scale: false,
                        lineStyle: {
                            width: 1.5,
                        },
                    },
                    lineStyle: {
                        color: graphData[key].color,
                        width: 1.5,
                    },
                    markPoint: {
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
                    },
                    markLine: {
                        animation: true,
                        silent: true,
                        symbol: "none",
                        label: { show: false},
                        data: ml,
                    },
                    data: graphData[key].dataPoints,
                });
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
                                color: "green",
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
