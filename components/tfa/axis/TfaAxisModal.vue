<template>
    <Dialog v-model="isOpen">
        <DialogTrigger as-child>
            <Button size="icon" type="button" variant="ghost">
                <!-- @click="toggleModal('axes')" -->
                <IHeroiconsPlus />
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <div class="flex gap-4 items-center">
                    <DialogTitle>{{ title }}</DialogTitle>
                </div>
                <DialogDescription>Add axis.</DialogDescription>
            </DialogHeader>
            <TfaAxisAdd
                :axis-to-edit="axisToEdit"
                @close-modal="closeModal"
                @reload-graph="emitReloadGraph"
            />
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
interface Axis {
    color: string
    feature: Feature
    id: number
    name: string
    samplingRate?: number
}

interface Props {
    axisToEdit?: Axis
    title: string
    toggleModalVisibility: boolean
}
const props = withDefaults(defineProps<Props>(), {
    axisToEdit: undefined,
})

const emit = defineEmits<{
    reloadGraph: []
}>()

const isOpen = ref(false)

// methods
const closeModal = () => {
    isOpen.value = false
}
const emitReloadGraph = () => {
    emit('reloadGraph')
}

// lifecycle
watch(
    () => props.toggleModalVisibility,
    (newVal) => {
        if (newVal) {
            isOpen.value = true
        } else {
            closeModal()
        }
    },
)
</script>
