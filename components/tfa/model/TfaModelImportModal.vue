<template>
    <Dialog v-model="isOpen">
        <DialogTrigger as-child>
            <Button variant="outline" class="flex gap-2">
                <IHeroiconsWrench />
                <span>Model</span>
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <div class="flex gap-4 items-center">
                    <DialogTitle>Feature configuration</DialogTitle>
                    <Switch
                        :checked="showFeatureConfiguration"
                        @update:checked="
                            (isChecked) =>
                                (showFeatureConfiguration = isChecked)
                        "
                    />
                </div>
                <DialogDescription>Tweak your models.</DialogDescription>
            </DialogHeader>
            <div>
                <TfaModelConfiguration
                    v-if="!showFeatureConfiguration"
                    :toggle-config-download="toggleModelConfigDownload"
                    @set-invalid-feedback="setInvalidFeedback"
                    @close-modal="(isOpen = false)"
                />
                <TfaModelFeatureConfiguration
                    v-if="showFeatureConfiguration"
                    :toggle-config-download="toggleModelFeatureConfigDownload"
                    @set-invalid-feedback="setInvalidFeedback"
                    @close-modal="(isOpen = false)"
                />
                <!-- <div
                    v-if="showInvalidFeedback"
                     role="alert"
                >
                    {{ showInvalidFeedback }}
                </div> -->
            </div>
            <DialogFooter>
                <DialogClose as-child>
                    <Button type="button" variant="secondary">Close</Button>
                </DialogClose>
                <Button @click="toggleDownloadConfig">
                    Save Configuration
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup lang="ts">
// data
const showFeatureConfiguration = ref(false)
const showInvalidFeedback = ref<string>()
const toggleModelConfigDownload = ref(false)
const toggleModelFeatureConfigDownload = ref(false)
const isOpen = ref(false)

// methods
const setInvalidFeedback = (invalidFeedback: string) => {
    showInvalidFeedback.value = invalidFeedback
}
const toggleDownloadConfig = () => {
    if (showFeatureConfiguration.value) {
        toggleModelFeatureConfigDownload.value =
            !toggleModelFeatureConfigDownload.value
    } else {
        toggleModelConfigDownload.value = !toggleModelConfigDownload.value
    }
}

// lifecycle
// watch(
//     () => props.toggleModelModalVisibility,
//     (newValue) => {
//         if (!newValue) return
//         showInvalidFeedback.value = undefined
//     },
// )
watch(showFeatureConfiguration, () => {
    showInvalidFeedback.value = undefined
})
</script>
