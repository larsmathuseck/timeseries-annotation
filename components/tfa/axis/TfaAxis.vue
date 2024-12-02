<template>
    <div class="flex justify-between items-center">
        <div class="flex gap-2 items-center">
            <span
                class="rounded-lg px-2"
                :style="{ backgroundColor: axis.color }"
            >
                {{ axis.name }}
            </span>
            <Button size="icon" type="button" variant="ghost" @click="editAxis">
                <IHeroiconsPencil />
            </Button>
        </div>
        <Switch :checked="isSelectedLocal" @update:checked="toggleAxis" />
    </div>
</template>

<script setup lang="ts">
interface Props {
    axis: Axis
    isSelected?: boolean
}
const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
    editAxis: [axis: Axis]
}>()

const store = useTfaStore()

// data
const isSelectedLocal = ref(props.isSelected)

// methods
const toggleAxis = (isChecked: boolean) => {
    if (!store.dataFileSelectedId) return

    if (Object.entries(store.dataFileSelectedAxes).length <= 1) {
        isSelectedLocal.value = true
        alert('At least 1 axis must be selected!')
        return
    }

    store.dataFiles[store.dataFileSelectedId].axes[props.axis.id].isSelected =
        isChecked
}
const editAxis = (event: Event) => {
    event.stopPropagation()
    emit('editAxis', props.axis)
}

// lifecycle
watch(
    () => props.isSelected,
    (newValue) => {
        isSelectedLocal.value = newValue
    },
)
</script>
