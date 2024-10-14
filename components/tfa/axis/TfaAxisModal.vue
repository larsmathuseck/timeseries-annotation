<template>
    <div
        ref="axesModalRef"
        class="modal fade"
        tabindex="-1"
        aria-hidden="false"
    >
        <div class="modal-dialog modal-dialog-centered modal-m">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ title }}</h5>
                    <button
                        type="button"
                        class="btn-close"
                        aria-label="Close"
                        @click="closeModal"
                    ></button>
                </div>
                <div class="modal-body">
                    <TfaAxisAdd
                        :axis-to-edit="axisToEdit"
                        @closeModal="closeModal"
                        @reloadGraph="emit('reloadGraph')"
                    ></TfaAxisAdd>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Feature } from '~/util/model/statistics'

interface Props {
    axisToEdit: {
        color: string
        feature: Feature
        id: number
        name: string
        samplingRate?: number
    }
    title: string
    toggleModalVisibility: boolean
}
const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
    reloadGraph: []
}>()

const { $bootstrap } = useNuxtApp()

// refs
const axesModalRef = ref()

// data
const modal = ref()

// methods
const closeModal = () => {
    modal.value?.hide()
}

// lifecycle
onMounted(() => {
    modal.value = new $bootstrap.Modal(axesModalRef.value)
})
watch(
    () => props.toggleModalVisibility,
    () => {
        modal.value?.show()
    },
)
</script>

<style scoped>
.modal-body {
    padding: 0px;
}
</style>
