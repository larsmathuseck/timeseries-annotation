<template>
    <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-4 items-center">
            <Button
                ref="dropZoneRef"
                variant="secondary"
                class="w-full h-16 border-2 border-dashed border-muted-foreground rounded-lg flex justify-center items-center"
                :class="[...(isOverDropZone ? ['border-green-500'] : [''])]"
                @click="fileDialogOpen()"
            >
                Add files here
            </Button>
            <Button
                class="flex gap-2 w-full"
                variant="secondary"
                @click="tryFolderDialogOpen"
            >
                <IHeroiconsFolder />
                <span>or import a folder</span>
            </Button>
        </div>
        <div class="flex flex-col md:flex-row gap-4 w-full justify-around">
            <TfaSetupSource :count="countData" title="Data" />
            <TfaSetupSource
                :count="countAnnotations"
                is-optional
                title="Annotations"
            />
        </div>
        <Button class="flex gap-2" size="lg" @click="navigateTo('/')">
            <span class="text-base">Start annotating</span>
            <IHeroiconsArrowRight />
        </Button>
    </div>
</template>

<script setup lang="ts">
const store = useTfaStore()

// runtime configuration
const runtimeConfig = useRuntimeConfig()
const annotationColumnNames =
    runtimeConfig.public.tfa.annotationColumnNames.split(',')
const hashAlgorithm = runtimeConfig.public.tfa.hashAlgorithm

// folder input
const { tryFolderDialogOpen } = useTfaFolderDialog({
    onChange: (files) => addFiles({ annotationColumnNames, files, store }),
})

// dropzone / file input
const dropZoneRef = ref<HTMLDivElement>()
const { isOverDropZone } = useTfaDropZone({
    onDrop: (files) =>
        addFiles({ annotationColumnNames, files, hashAlgorithm, store }),
    ref: dropZoneRef,
})
const { fileDialogOpen } = useTfaFileDialog({
    onChange: (files) =>
        addFiles({ annotationColumnNames, files, hashAlgorithm, store }),
})

const countData = ref(0)
const countAnnotations = getLiveQuery(() => database.annotationFile.count())

watch(store.dataFiles, (data) => {
    countData.value = Object.keys(data).length
})
</script>
