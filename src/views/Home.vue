<template>
  <input type="file" ref="fileInput" webkitdirectory directory multiple v-on:change="onFileChange">
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
import { ref } from "vue";

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
  name: "Home",
  components: {
      VChart
  },
  data: () => {
    return {
      showGraph: true,
    }
  },
  methods: {
    onFileChange(e){
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = e => console.log(e.target.result);
      reader.readAsText(file);
    }
  },
  provide: {
    [THEME_KEY]: "light"
  },
  // computed: {
  //   datapoints: () => {
  //     let data = [Math.random() * 300];

  //     for (let i = 1; i < 20000; i++) {
  //       data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
  //     }
  //     return data;
  //   },
  //   date: () => {
  //     let base = +new Date(1968, 9, 3);
  //     let oneDay = 24 * 3600 * 1000;
  //     let temp = [];

  //     for (let i = 1; i < 20000; i++) {
  //       var now = new Date((base += oneDay));
  //       temp.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'));
  //     }
  //     return temp;
  //   }
  // },
  setup () {
    let base = +new Date(1968, 9, 3);
    let oneDay = 24 * 3600 * 1000;
    let date = [];

    let data = [Math.random() * 300];

    for (let i = 1; i < 20000; i++) {
      var now = new Date((base += oneDay));
      date.push([now.getFullYear(), now.getMonth() + 1, now.getDate()].join('/'));
      data.push(Math.round((Math.random() - 0.5) * 20 + data[i - 1]));
    }

    const option = ref({
      tooltip: {
        trigger: 'axis',
        position: function (pt) {
          return [pt[0], '10%'];
        }
      },
      title: {
        left: 'center',
        text: 'Large Area Chart'
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          restore: {},
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: date,
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%']
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 10
        },
        {
          start: 0,
          end: 10
        }
      ],
      series: [
        {
          name: "Data",
          type: "line",
          symbol: 'none',
          sampling: 'lttb',
          itemStyle: {
            color: 'rgb(255, 70, 131)'
          },
          data: data,
          // areaStyle: {
          //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          //     {
          //       offset: 0,
          //       color: 'rgb(255, 158, 68)'
          //     },
          //     {
          //       offset: 1,
          //       color: 'rgb(255, 70, 131)'
          //     }
          //   ])
          // },
        }
      ]
    });

    return { option };
  }
};
</script>

<style scoped>
.chart {
  height: 600px;
}
</style>
