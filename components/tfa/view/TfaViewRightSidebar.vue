<template>
    <div class="row">
        <label class="description-text"> Annotations </label>
        <div id="scroll-container-annotations">
            <div
                v-for="(annotation, index) in annotations"
                :key="annotation.id"
                class="row axis-annotation-container ps-0"
            >
                <TfaAnnotation :annotation="annotation" :index="index + 1" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'
import { db } from '../../../db'

// async data
const annotationData = useObservable(
    from(
        liveQuery(async () => {
            const curr = await db.lastSelected.where('id').equals(1).first()
            const annotations = await db.annoData
                .where('annotationId')
                .equals(curr?.annotationId || 1)
                .sortBy('timestamp')

            const annotationsLabeled = []

            for (const annotation of annotations) {
                annotationsLabeled.push({
                    ...annotation,
                    label: await db.labels.get(annotation.labelId),
                })
            }

            return annotationsLabeled
        }),
    ),
)

// computations
const annotations = computed(() => {
    const annotations: {
        color: string
        id: number
        name: string
        timestamp: string
    }[] = []

    if (annotationData.value) {
        for (const annotationDataItemPromise of annotationData.value) {
            const annotationDataItem = annotationDataItemPromise
            const label = annotationDataItem.label

            if (!label) continue

            annotations.push({
                color: label.color,
                id: annotationDataItem.id,
                name: label.name,
                timestamp: DateTime.fromMillis(
                    annotationDataItem.timestamp,
                ).toFormat('HH:mm:ss SSS'),
            })
        }
    }
    return annotations
})
</script>

<style scoped>
#scroll-container-annotations {
    overflow-y: auto;
    max-height: 80vh;
}
#scroll-container-annotations::-webkit-scrollbar {
    width: 0px;
    height: 0px;
}
</style>
