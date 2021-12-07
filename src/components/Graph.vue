<template>
    <div @click="chartClicked">
        <v-chart ref="charts" v-if="showGraph" class="chart" :option="option" @datazoom="zoom" />
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
            showGraph: true,
            dataZoomStart: 0,
            dataZoomEnd: 100,
            tempDataZoomStart: 0,
            tempDataZoomEnd: 100,
        };
    },
    provide: {
        [THEME_KEY]: "light",
    },
    methods: {
        chartClicked: function (event) {
            let pointInPixel = [event.offsetX, event.offsetY];
            if (this.$refs.charts.containPixel("grid", pointInPixel)) {
                let pointInGrid = this.$refs.charts.convertFromPixel("grid", pointInPixel);
                this.$store.commit("addAnnotationPoint", Math.round(pointInGrid[0]));
            }
        },
        zoom: function (event) {
            if (event.start !== undefined && event.end !== undefined) {
                this.tempDataZoomStart = event.start;
                this.tempDataZoomEnd = event.end;
            } else if (event.batch !== undefined) {
                this.tempDataZoomStart = event.batch[0].start;
                this.tempDataZoomEnd = event.batch[0].end;
            }
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
                    y: "15%"
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
                    },
                    itemStyle: {
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
                height: 500,
                animation: true,
                responsive: true,
                maintainAspectRatio: false,
                clip: true,
                sampling: "max",
                series: series,
                tooltip: {
                    trigger: "axis",
                    formatter: '{b0}',
                },
                // toolbox: {
                //     feature: {
                //         dataZoom: {
                //             yAxisIndex: "none",
                //         },
                //     },
                // },
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
                dataZoom: [
                    {
                        type: "inside",
                        start: this.dataZoomStart,
                        end: this.dataZoomEnd,
                        filterMode: "filter",
                    },
                    {
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
                        height: 100,
                        bottom: 10,
                        show: true,
                        type: "slider",
                        start: this.dataZoomStart,
                        end: this.dataZoomEnd,
                        handleSize: "70%",
                    },
                ],
            };
        },
    },
    watch:{
        option: function(){
            this.$refs.charts.clear();
            this.dataZoomStart = this.tempDataZoomStart;
            this.dataZoomEnd = this.tempDataZoomEnd;
        }
    }
}

</script>

<style scoped>

.chart {
    height: 700px;
}

</style>
