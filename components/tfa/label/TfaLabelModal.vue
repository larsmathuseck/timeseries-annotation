<template>
    <div
        ref="labelModalRef"
        class="modal fade"
        tabindex="-1"
        aria-hidden="false"
    >
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add Label</h5>
                    <button
                        type="button"
                        class="btn-close"
                        aria-label="Close"
                        @click="closeModal"
                    ></button>
                </div>
                <div class="modal-body p-0">
                    <TfaLabelAdd
                        :key="addLabelKey"
                        :label-to-edit="labelToEdit"
                        @labelCreated="onLabelCreated"
                        @labelEdited="labelEdited"
                        @closeModal="closeModal"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { db } from '../../../db'

interface Props {
    addLabelKey: number
    labelToEdit: {
        color: string
        id: number
        name: string
    }
    toggleModalVisibility: boolean
}
const props = withDefaults(defineProps<Props>(), {})

const { $bootstrap } = useNuxtApp()

// refs
const labelModalRef = ref()

// data
const modal = ref()

// methods
const closeModal = () => {
    modal.value?.hide()
}
const onLabelCreated = async (label: { color: string; name: string }) => {
    const currentAnnotation = await db.lastSelected
        .where('id')
        .equals(1)
        .first()

    if (!currentAnnotation) return

    db.labels.add({
        name: label.name,
        color: label.color,
        annotationId: currentAnnotation.annotationId,
        annotationIdName: null,
    })
    modal.value?.hide()
}
const labelEdited = (label: { color: string; id: number; name: string }) => {
    db.labels.update(label.id, {
        name: label.name,
        color: label.color,
    })
    modal.value?.hide()
}

// lifecycle
onMounted(() => {
    modal.value = new $bootstrap.Modal(labelModalRef.value)
})
watch(
    () => props.toggleModalVisibility,
    () => {
        modal.value?.show()
    },
)
</script>
