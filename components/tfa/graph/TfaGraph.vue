<template>
    <div ref="chartDiv" @mouseup="chartClicked" @mousedown="dragDetection">
        <v-chart
            ref="chartsRef"
            class="chart"
            :init-options="init"
            :option="option"
            @datazoom="zoom"
        />
    </div>
</template>

<script setup lang="ts">
import { useObservable, from } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
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
} from 'echarts/components'
import type { ECBasicOption } from 'echarts/types/dist/shared'
import VChart, { THEME_KEY } from 'vue-echarts'

import { db } from '../../../db'
import { getOption } from '../../../util/graph.js'

const emit = defineEmits<{
    loading: [loading: boolean]
}>()

provide(THEME_KEY, 'light!')

const store = useTfAnnotatorStore()
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
])

// refs
const chartsRef = ref()

// async data
const currentAnnotation = useObservable(
    from(liveQuery(() => db.lastSelected.where('id').equals(1).first())),
)
const annoData = useObservable(
    from(
        liveQuery(async () => {
            const curr = await db.lastSelected.where('id').equals(1).first()
            const annotations = await db.annoData
                .where('annotationId')
                .equals(curr?.annotationId || 1)
                .sortBy('timestamp')

            const annotationsLabeled = []

            for (const annotation of annotations) {
                const label = await db.labels.get(annotation.labelId)

                if (!label) continue

                annotationsLabeled.push({
                    ...annotation,
                    label,
                })
            }

            return annotationsLabeled
        }),
    ),
)
const areaData = useObservable(
    from(
        liveQuery(async () => {
            const curr = await db.lastSelected.where('id').equals(1).first()
            const areas = await db.areas
                .where('annotationId')
                .equals(curr?.annotationId || 1)
                .toArray()

            const areasLabeled = []

            for (const area of areas) {
                const label = await db.labels.get(area.labelId)

                if (!label) continue

                areasLabeled.push({
                    ...area,
                    label,
                })
            }

            return areasLabeled
        }),
    ),
)

// data
const dataZoomStart = ref(0)
const dataZoomEnd = ref(100)
const tempDataZoomStart = ref(0)
const tempDataZoomEnd = ref(100)
// const resize = ref(true)
const sizeOfGraph = ref(0)
const clickX = ref(0)
const clickY = ref(0)
const option = ref<ECBasicOption>()
const init = ref({ useDirtyRect: true })

// // computations
// graphData() {
//     return store.dataSelected
// },
// areasVisible() {
//     return store.isAreasVisible
// },

// methods
const chartClicked = (event: MouseEvent) => {
    const diffX = Math.abs(event.pageX - clickX.value)
    const diffY = Math.abs(event.pageY - clickY.value)
    if (diffX < 3 && diffY < 3) {
        const pointInPixel = [event.offsetX, event.offsetY]
        if (chartsRef.value.containPixel('grid', pointInPixel)) {
            const pointInGrid = chartsRef.value.convertFromPixel(
                'grid',
                pointInPixel,
            )
            addAnnotationPoint(Math.round(pointInGrid[0]))
        }
    }
}
const addAnnotationPoint = (timestamp: number) => {
    const time = new Date(timestamp).getTime()
    const label = store.labelActive
    if (label && currentAnnotation.value !== undefined) {
        db.annoData.add({
            labelId: label.id,
            annotationId: currentAnnotation.value.annotationId,
            timestamp: time,
        })
    }
}
const dragDetection = (event: MouseEvent) => {
    clickX.value = event.pageX
    clickY.value = event.pageY
}
const zoom = (event: {
    batch: { end: number; start: number }[]
    end: number
    start: number
}) => {
    if (event.start !== undefined && event.end !== undefined) {
        tempDataZoomStart.value = event.start
        tempDataZoomEnd.value = event.end
    } else if (event.batch !== undefined) {
        tempDataZoomStart.value = event.batch[0].start
        tempDataZoomEnd.value = event.batch[0].end
    }
}
const resizeChart = () => {
    chartsRef.value?.resize()
}
const updateGraph = () => {
    dataZoomStart.value = tempDataZoomStart.value
    dataZoomEnd.value = tempDataZoomEnd.value

    emit('loading', true)

    setTimeout(() => {
        if (!annoData.value || !areaData.value) return

        chartsRef.value?.clear()
        option.value = getOption(
            store.dataSelected,
            store.timestampsSelected,
            annoData.value,
            areaData.value,
            store.isAreasVisible,
            sizeOfGraph.value,
            dataZoomStart.value,
            dataZoomEnd.value,
        )
    }, 10)
}

// lifecycle
onMounted(() => {
    sizeOfGraph.value = chartsRef.value?.getHeight() - 140
    window.addEventListener('resize', () => {
        resizeChart()
        sizeOfGraph.value = chartsRef.value?.getHeight() - 140
    })
})
onUpdated(() => {
    emit('loading', false)
})
watch(
    () => store.dataSelected,
    () => updateGraph(),
)
watch(annoData, () => updateGraph())
watch(areaData, () => updateGraph())
watch(
    () => store.isAreasVisible,
    () => updateGraph(),
)
watch(
    () => sizeOfGraph,
    () => updateGraph(),
)
</script>

<style scoped>
.chart {
    height: 100%;
    padding-bottom: 20px;
}
</style>
