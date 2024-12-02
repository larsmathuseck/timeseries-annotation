<template>
    <div class="h-full" @mouseup="chartClicked" @mousedown="onMouseDown">
        <VChart
            ref="chartsRef"
            :init-options="chartInitOptions"
            :option="chartOption"
            @datazoom="onZoom"
        />
    </div>
</template>

<script setup lang="ts">
import { useObservable, from } from '@vueuse/rxjs'
import debounce from 'debounce'
import { liveQuery } from 'dexie'

const emit = defineEmits<{
    loading: [loading: boolean]
}>()

const colorMode = useColorMode()
const store = useTfaStore()

provide(THEME_KEY, colorMode.value)

// refs
const chartsRef = ref()

// async data
const annotationFileSelected = useObservable(
    from(
        liveQuery(() =>
            database.annotationFileSelected.where('id').equals(1).first(),
        ),
    ),
)
const annotationTimestampsLabeled = useObservable(
    from(
        liveQuery(async () => {
            const fileSelected = await database.annotationFileSelected
                .where('id')
                .equals(1)
                .first()
            const annotationTimestamps = await database.annotationTimestamp
                .where('annotationId')
                .equals(fileSelected?.annotationId || 1)
                .sortBy('timestamp')

            const timestampsLabeled = []

            for (const timestamp of annotationTimestamps) {
                const label = await database.annotationLabel.get(
                    timestamp.labelId,
                )

                if (!label) continue

                timestampsLabeled.push({
                    ...timestamp,
                    label,
                })
            }

            return timestampsLabeled
        }),
    ),
)
const areaData = useObservable(
    from(
        liveQuery(async () => {
            const curr = await database.annotationFileSelected
                .where('id')
                .equals(1)
                .first()
            const areas = await database.annotationArea
                .where('annotationId')
                .equals(curr?.annotationId || 1)
                .toArray()

            const areasLabeled = []

            for (const area of areas) {
                const label = await database.annotationLabel.get(area.labelId)

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
const chartInitOptions = ref({ useDirtyRect: true })
const chartOption = ref<ECOption>()
const clickX = ref(0)
const clickY = ref(0)
const dataZoomEnd = ref(100)
const dataZoomStart = ref(0)
const sizeOfGraph = ref(0)
const tempDataZoomEnd = ref(100)
const tempDataZoomStart = ref(0)

// methods
const chartClicked = (event: MouseEvent) => {
    const diffX = Math.abs(event.pageX - clickX.value)
    const diffY = Math.abs(event.pageY - clickY.value)

    if (diffX >= 3 || diffY >= 3) return // the chart has been dragged

    const pointInPixel = [event.offsetX, event.offsetY]

    if (chartsRef.value?.containPixel('grid', pointInPixel)) {
        const pointInGrid = chartsRef.value.convertFromPixel(
            'grid',
            pointInPixel,
        )
        const timestamp = Math.round(pointInGrid[0])
        const time = new Date(timestamp).getTime()
        const label = store.labelActive

        if (label && annotationFileSelected.value) {
            database.annotationTimestamp.add({
                labelId: label.id,
                annotationId: annotationFileSelected.value.annotationId,
                timestamp: time,
            })
        }
    }
}
const onMouseDown = (event: MouseEvent) => {
    // for drag detection in `chartClicked`
    clickX.value = event.pageX
    clickY.value = event.pageY
}
const onZoom = (event: {
    batch: { end: number; start: number }[]
    end: number
    start: number
}) => {
    if (event.start !== undefined && event.end !== undefined) {
        tempDataZoomStart.value = event.start
        tempDataZoomEnd.value = event.end
    } else if (event.batch) {
        tempDataZoomStart.value = event.batch[0].start
        tempDataZoomEnd.value = event.batch[0].end
    }
}
const updateGraph = debounce(() => {
    dataZoomStart.value = tempDataZoomStart.value
    dataZoomEnd.value = tempDataZoomEnd.value

    emit('loading', true)

    setTimeout(() => {
        if (!annotationTimestampsLabeled.value || !areaData.value) return

        chartsRef.value?.clear()

        const axesSelected = Object.entries(store.dataFileSelectedAxes)
            .map(([_id, axis]) => (axis.isSelected ? axis : undefined))
            .filter((x) => !!x)
            .filter((x) => x.isSelected)

        chartOption.value = getOption({
            // timestamps: store.timestampsSelected,
            annotations: annotationTimestampsLabeled.value,
            areas: areaData.value,
            areasVisible: store.isAreasVisible,
            dataZoomEnd: dataZoomEnd.value,
            dataZoomStart: dataZoomStart.value,
            graphData: axesSelected,
            sizeOfGraph: sizeOfGraph.value,
        })
        emit('loading', false)
    }, 10)
}, 300)
const resizeChart = () => {
    sizeOfGraph.value = chartsRef.value?.getHeight() - 140
    chartsRef.value?.resize()
}

// lifecycle
onMounted(() => {
    sizeOfGraph.value = chartsRef.value?.getHeight() - 140
    window.addEventListener('resize', resizeChart)
    updateGraph()
})
onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart)
})
watch(() => store.dataFileSelectedId, updateGraph)
watch(store.dataFiles, updateGraph)
watch(annotationTimestampsLabeled, updateGraph)
// watch(areaData, updateGraph)
// watch(() => store.isAreasVisible, updateGraph)
// watch(sizeOfGraph, updateGraph)
</script>
