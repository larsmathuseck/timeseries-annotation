<template>
    <div ref="chartDiv" @mouseup="chartClicked" @mousedown="dragDetection">
        <v-chart ref="charts" class="chart" :init-options="init" :option="option" @datazoom="zoom"/>
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
import { liveQuery } from "dexie";
import { db } from "/db";
import { useObservable } from "@vueuse/rxjs";
import { getOption } from "../util/graphOptions";

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
    setup() {
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
            option: null,
            graphData: null,
            init: { useDirtyRect: true },
        };
    },
    provide: {
        [THEME_KEY]: "light",
    },
    methods: {
        chartClicked: function (event) {
            const diffX = Math.abs(event.pageX - this.clickX);
            const diffY = Math.abs(event.pageY - this.clickY);
            if(diffX < 3 && diffY < 3) {
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
            if(label != null && currAnn != undefined) {
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
        },
        updateGraph() {
            this.dataZoomStart = this.tempDataZoomStart;
            this.dataZoomEnd = this.tempDataZoomEnd;
            this.$emit('loading', true);
            setTimeout(() => {
                this.$refs.charts?.clear();
                this.option = getOption(this.graphData, this.$store.getters.timestamps, this.annoData, this.areaData, this.areasVisible, this.sizeOfGraph, this.dataZoomStart, this.dataZoomEnd);
            }, 10);
        },
    },
    computed: {
        areasVisible() {
            return this.$store.state.areasVisible;
        },
        data() {
            return this.$store.state.data[this.$store.state.selectedData];
        },
        selectedAxes() {
            return this.$store.getters.selectedAxes;
        }
    },
    watch:{
        annoData() {
            this.updateGraph();
        },
        areaData() {
            this.updateGraph();
        },
        areasVisible() {
            this.updateGraph();
        },
        sizeOfGraph() {
            this.updateGraph();
        },
        data: {
            handler() {
                if(this.data != null) {
                    this.graphData = Object.fromEntries(Object.entries(this.data.axes).filter(key => this.data.selectedAxes.includes(key[1].id)));
                }
                else {
                    this.graphData = null;
                }
                this.updateGraph();
            },
            deep: true,
            immediate: true,
        }
    },
    mounted() {
        this.sizeOfGraph = this.$refs.charts?.getHeight() - 140;
        window.addEventListener("resize", () => {
            this.resizeChart();
            this.sizeOfGraph = this.$refs.charts?.getHeight() - 140;
        })
    },
    updated() {
        this.$emit('loading', false);
    },
}

</script>

<style scoped>

.chart {
    height: 100%;
    padding-bottom: 20px;
}

</style>
