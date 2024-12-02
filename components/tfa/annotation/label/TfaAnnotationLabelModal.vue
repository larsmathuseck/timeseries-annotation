<template>
    <Dialog v-model="isOpen">
        <DialogTrigger>
            <Button size="icon" type="button" variant="ghost">
                <!-- @click="toggleModal('label')" -->
                <IHeroiconsPlus />
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <div class="flex gap-4 items-center">
                    <DialogTitle>Label</DialogTitle>
                </div>
                <DialogDescription>Add label.</DialogDescription>
            </DialogHeader>
            <TfaAnnotationLabelAdd
                :key="addLabelKey"
                :label-to-edit="labelToEdit"
                @label-created="onLabelCreated"
                @label-edited="labelEdited"
                @close-modal="closeModal"
            />
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
interface Label {
    color: string
    id: number
    name: string
}

interface Props {
    addLabelKey: number
    labelToEdit?: Label
    toggleModalVisibility: boolean
}
const props = withDefaults(defineProps<Props>(), {
    labelToEdit: undefined,
})

const isOpen = ref(false)

// methods
const closeModal = () => {
    isOpen.value = false
}
const onLabelCreated = async (label: { color: string; name: string }) => {
    const currentAnnotation = await database.annotationFileSelected
        .where('id')
        .equals(1)
        .first()

    if (!currentAnnotation) return

    await database.annotationLabel.add({
        name: label.name,
        color: label.color,
        annotationId: currentAnnotation.annotationId,
        annotationIdName: null,
    })
    closeModal()
}
const labelEdited = async (label: Label) => {
    if (label.id) {
        await database.annotationLabel.update(label.id, {
            name: label.name,
            color: label.color,
        })
    }
    closeModal()
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
    { immediate: true },
)
</script>
