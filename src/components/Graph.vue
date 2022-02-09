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
import { liveQuery } from "dexie";
import { db } from "/db";
import { useObservable } from "@vueuse/rxjs";

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
    name: "Graph",
    components: {
        VChart,
    },
    setup: function(){
        const currAnn = useObservable(liveQuery(() => db.lastSelected.where('id').equals(1).first()));
        const annoData = useObservable(liveQuery(async () => {
            const curr = await db.lastSelected.where('id').equals(1).first();
            const annotations = await db.annoData.where('annoId').equals(parseInt(curr?.annoId || 1)).sortBy('timestamp');
            await Promise.all (annotations.map (async anno => {
                [anno.label] = await Promise.all([
                    db.labels.get(anno.labelId)
                ]);
            }));
            return annotations;
        }));
        const areaData = useObservable(liveQuery(async () => {
            const curr = await db.lastSelected.where('id').equals(1).first();
            const areas = await db.areas.where('annoId').equals(parseInt(curr?.annoId || 1)).toArray();
            await Promise.all (areas.map (async area => {
                [area.label] = await Promise.all([
                    db.labels.get(area.labelId)
                ]);
            }));
            return areas;
        }));
        return {
            currAnn,
            annoData,
            areaData,
        }
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
                    this.addAnnotationPoint(Math.round(pointInGrid[0]));
                }
            }
        },
        addAnnotationPoint: function (timestamp) {
            let time = new Date(timestamp).getTime();
            let label = this.$store.state.activeLabel;
            let currAnn = this.currAnn;
            if(label != null && currAnn != undefined){
                db.annoData.add({labelId: label.id, annoId: currAnn.annoId, timestamp: time});
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
            let annotations = this.annoData;
            let areas = this.areaData;
            let ann;
            let ml;
            let area;
            if(annotations != undefined){
                ann = annotations.map((x, i) => {
                    return {
                        symbol: "pin",
                        itemStyle: {
                        color: x.label.color
                        },
                        name: (i + 1).toString() + " " + x.label.name,
                        xAxis: new Date(x.timestamp),
                        y: "75"
                    };
                });
                ml = annotations.map(x => {
                    return {
                        itemStyle: {
                            color: x.label.color
                        },
                        xAxis: new Date(x.timestamp),
                    };
                });
            }
            if (this.areaVisible && areas != undefined) {
                if (areas.length != 0) {
                    area = areas.map(x => {
                        return [
                            {
                                xAxis: new Date(x.firstTimestamp),
                                itemStyle: {
                                    color: x.label.color,
                                    opacity: 0.5,
                                    borderColor: "black",
                                    borderWidth: 0.2,
                                    borderType: "solid"
                                },
                            },
                            {
                                xAxis: new Date(x.secondTimestamp),
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
                            width: 1.5,
                            color: graphData[key].color,
                        },
                    },
                    lineStyle: {
                        color: graphData[key].color,
                        width: 1.5,
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
        areaVisible: function() {
            return this.$store.state.areaVisible;
        }
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
