<template>
    <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <div class="flex gap-2 items-center">
            <div
                class="flex items-center rounded-full pr-2 overflow-hidden"
                :class="[
                    ...(isActive ? ['ring ring-black dark:ring-white'] : []),
                ]"
                :style="{ backgroundColor: label.color }"
            >
                <Button
                    size="xs"
                    type="button"
                    variant="ghost"
                    @click="deleteLabel"
                >
                    <IHeroiconsXMark />
                </Button>
                <span class="truncate">
                    {{ label.name }}
                </span>
            </div>
        </div>
        <div class="flex gap-2">
            <Button size="xs" type="button" variant="ghost" @click="editLabel">
                <IHeroiconsPencil />
            </Button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { IndexableType } from 'dexie'

interface Props {
    label: {
        color: string
        id: number
        name: string
    }
}
const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
    editLabel: [label: { id: IndexableType }]
}>()

const store = useTfaStore()

// computations
const isActive = computed(() => store.labelActive?.id === props.label.id)

// methods
const deleteLabel = (event: Event) => {
    event.stopPropagation()
    database.annotationLabel.delete(props.label.id)
    database.annotationTimestamp
        .where('labelId')
        .equals(props.label.id)
        .delete()
    database.annotationArea.where('labelId').equals(props.label.id).delete()

    if (store.labelActive === props.label) {
        store.labelActive = undefined
    }
}
const editLabel = (event: Event) => {
    event.stopPropagation()
    emit('editLabel', props.label)
}
</script>
