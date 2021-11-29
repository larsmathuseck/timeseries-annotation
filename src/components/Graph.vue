<template>
    <!--<input type="file" ref="fileInput" webkitdirectory directory multiple v-on:change="onFileChange">-->
    <v-chart v-if="showGraph" class="chart" :option="option" />
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
]);

export default {
    name: "Graph",
    components: {
        VChart,
    },
    data: function () {
        return {
        showGraph: true,
        };
    },
    methods: {
        
    },
    provide: {
        [THEME_KEY]: "light",
    },
    computed: {
        option: function () {
        let series = [];
        let graphData = this.$store.getters.getData;
        let legende = [];
        for(let key in graphData){
            legende.push(graphData[key].name);
            series.push({
                name: graphData[key].name,
                type: "line",
                symbol: "none",
                showSymbol: false,
                itemStyle: {
                    color: graphData[key].color,
                },
                data: graphData[key].dataPoints,
            });
        }

        return {
            tooltip: {
                trigger: "axis",
                formatter: '{b0}',
            },
            toolbox: {
                feature: {
                    dataZoom: {
                    yAxisIndex: "none",
                },
            },
            },
            legend: {
                data: legende
            },
            xAxis: {
                type: "time",
                data: this.$store.state.timestamps,
            },
            yAxis: {
                type: "value",
            },
            dataZoom: [
            {
                type: "inside",
                start: 0,
                end: 100,
                filterMode: "filter",
            },
            {
                animation: true,
                showDataShadow: true,
                filterMode: "filter",
                throttle: 100,
                dataBackground: {
                lineStyle: {
                    color: "#" + (((1 << 24) * Math.random()) | 0).toString(16),
                    width: 2.5,
                },
                areaStyle: {
                    color: "#ffffff00",
                },
                },
                height: 100,
                bottom: 10,
                show: true,
                type: "slider",
                start: 0,
                end: 100,
                handleSize: "70%",
            },
            ],
            color: "#" + (((1 << 24) * Math.random()) | 0).toString(16),
            height: 500,
            animation: true,
            responsive: true,
            maintainAspectRatio: false,
            clip: true,
            sampling: "max",
            series: series,
        };
        },
    },
};

</script>

<style scoped>

.chart {
    height: 700px;
}

</style>
