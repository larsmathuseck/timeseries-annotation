<template>
    <div class="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
        <span class="truncate font-mono">
            {{ annotation.timestamp }}
        </span>
        <div
            class="flex items-center pl-2 rounded-full overflow-hidden"
            :style="{ backgroundColor: annotation.color }"
        >
            <span class="grow truncate">
                {{ index }} {{ annotation.name }}
            </span>
            <Button
                aria-label="Delete annotation"
                size="xs"
                type="button"
                variant="ghost"
                @click="deleteAnnotation(annotation)"
            >
                <IHeroiconsXMark />
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Annotation {
    color: string
    id: number
    name: string
    timestamp: string
}

interface Props {
    annotation: Annotation
    index: number
}
withDefaults(defineProps<Props>(), {})

// methods
const deleteAnnotation = ({ id }: Annotation) => {
    database.annotationTimestamp.delete(id)
}
</script>
