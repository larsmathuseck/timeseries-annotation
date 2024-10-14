<template>
    <div
        ref="importModelModalRef"
        class="modal fade"
        tabindex="-1"
        aria-hidden="false"
    >
        <div class="modal-dialog modal-dialog-scrollable modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Feature Configuration</h4>
                    <label class="switch ms-2">
                        <input
                            v-show="false"
                            v-model="showFeatureConfiguration"
                            type="checkbox"
                        />
                        <span class="slider round"></span>
                    </label>
                    <button
                        type="button"
                        class="btn-close"
                        aria-label="Close"
                        @click="closeModal"
                    ></button>
                </div>
                <div class="modal-body">
                    <TfaModelConfiguration
                        v-show="!showFeatureConfiguration"
                        :toggle-config-download="toggleModelConfigDownload"
                        @setInvalidFeedback="setInvalidFeedback"
                        @closeModal="closeModal"
                    />
                    <TfaFeatureModelConfiguration
                        v-show="showFeatureConfiguration"
                        :toggle-config-download="
                            toggleFeatureModelConfigDownload
                        "
                        @setInvalidFeedback="setInvalidFeedback"
                        @closeModal="closeModal"
                    />
                    <div
                        v-show="showInvalidFeedback?.length"
                        class="row justify-content-center"
                    >
                        <div class="col-12">
                            <div
                                class="alert alert-danger p-1 m-3"
                                role="alert"
                            >
                                {{ showInvalidFeedback }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button
                        class="btn btn-primary"
                        @click="toggleDownloadConfig"
                    >
                        Save Configuration
                    </button>
                    <button class="btn btn-secondary" @click="closeModal">
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    toggleModelModalVisibility: boolean
}
const props = withDefaults(defineProps<Props>(), {})

const { $bootstrap } = useNuxtApp()

// refs
const importModelModalRef = ref()

// data
const modal = ref()
const showFeatureConfiguration = ref(false)
const showInvalidFeedback = ref<string>()
const toggleModelConfigDownload = ref(false)
const toggleFeatureModelConfigDownload = ref(false)

// methods
const setInvalidFeedback = (invalidFeedback: string) => {
    showInvalidFeedback.value = invalidFeedback
}
const toggleDownloadConfig = () => {
    if (showFeatureConfiguration.value) {
        toggleFeatureModelConfigDownload.value =
            !toggleFeatureModelConfigDownload.value
    } else {
        toggleModelConfigDownload.value = !toggleModelConfigDownload.value
    }
}
const closeModal = () => {
    modal.value?.hide()
}

// lifecycle
onMounted(() => {
    modal.value = new $bootstrap.Modal(importModelModalRef.value)
})
watch(
    () => props.toggleModelModalVisibility,
    () => {
        showInvalidFeedback.value = undefined
        modal.value?.show()
    },
)
watch(showFeatureConfiguration, () => {
    showInvalidFeedback.value = undefined
})
</script>

<style scoped>
.modal-body {
    overflow-y: auto;
}

.switch {
    width: 3rem;
    height: 1.5rem;
}

.slider:before {
    height: 1.15rem;
    width: 1.15rem;
    left: 0.25rem;
    bottom: 0.2rem;
}

input:checked + .slider:before {
    -webkit-transform: translateX(1.25rem);
    -ms-transform: translateX(1.25rem);
    transform: translateX(1.3rem);
}
</style>
