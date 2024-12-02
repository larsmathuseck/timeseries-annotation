<template>
    <div class="flex flex-col gap-4">
        <span class="text-xl font-bold">Annotations</span>
        <div class="flex flex-col gap-1">
            <div
                v-for="(annotation, index) in annotations"
                :key="annotation.id"
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

interface Annotation {
    id: number
    timestamp: number
    labelId: number
}

interface LabeledAnnotation {
    id: number
    color: string
    name: string
    timestamp: string
}

const formatAnnotation = (
    annotation: Annotation,
    label: { color: string; name: string },
): LabeledAnnotation => ({
    id: annotation.id,
    color: label.color,
    name: label.name,
    timestamp: DateTime.fromMillis(annotation.timestamp).toFormat(
        'HH:mm:ss SSS',
    ),
})

// async data
const annotationData = useObservable(
    from(
        liveQuery(async () => {
            const current = await database.annotationFileSelected
                .where('id')
                .equals(1)
                .first()
            const annotations = await database.annotationTimestamp
                .where('annotationId')
                .equals(current?.annotationId || 1)
                .sortBy('timestamp')

            const labeledAnnotations = []

            for (const annotation of annotations) {
                const label = await database.annotationLabel.get(
                    annotation.labelId,
                )
                if (label) {
                    labeledAnnotations.push(formatAnnotation(annotation, label))
                }
            }

            return labeledAnnotations
        }),
    ),
)

// computations
const annotations = computed(() => annotationData.value ?? [])
</script>
