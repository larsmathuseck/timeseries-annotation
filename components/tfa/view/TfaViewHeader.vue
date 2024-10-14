<template>
    <div class="row justify-content-between">
        <div id="col-header-title" class="col col-md-auto col-12">
            <h1>{{ title }}</h1>
        </div>
        <div id="col-header-buttons" class="col col-md-auto col-12">
            <ul class="nav nav-pills">
                <li class="nav-item">
                    <input
                        ref="multipleFileUploadRef"
                        type="file"
                        webkitdirectory
                        directory
                        multiple
                        hidden
                        @change="onFileChange"
                    />
                    <button
                        type="button"
                        class="btn btn-light main-btn"
                        data-bs-toggle="popover"
                        data-bs-trigger="hover"
                        data-bs-placement="bottom"
                        data-bs-content="All unsaved changes will be lost"
                        @click="chooseFiles"
                    >
                        <i class="fa-solid fa-folder"></i>
                        Import Folder
                    </button>
                </li>
                <li class="nav-item">
                    <button
                        type="button"
                        class="btn btn-light main-btn"
                        @click="saveAnnotation"
                    >
                        <i class="fa-solid fa-download"></i>
                        Save Annotation
                    </button>
                </li>
                <li class="nav-item">
                    <button
                        type="button"
                        class="btn btn-light main-btn"
                        @click="
                            toggleModelModalVisibility =
                                !toggleModelModalVisibility
                        "
                    >
                        <i class="fa-solid fa-wrench"></i>
                        Model
                    </button>
                    <TfaImportModelModal
                        :toggle-model-modal-visibility="
                            toggleModelModalVisibility
                        "
                    />
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { stringify } from '@vanillaes/csv'
import { DateTime } from 'luxon'

import { loadFolder, download } from '../../../util/inputOutput'
import { db } from '../../../db'

interface Props {
    title: string
}
withDefaults(defineProps<Props>(), {})

const { $bootstrap } = useNuxtApp()
const store = useTfAnnotatorStore()

// refs
const multipleFileUploadRef = ref()

// data
const toggleModelModalVisibility = ref(false)

// methods
const chooseFiles = () => {
    multipleFileUploadRef.value.click()
}
const onFileChange = (e: Event) => {
    if (!e.target || !(e.target instanceof HTMLInputElement) || !e.target.files)
        return

    loadFolder(e.target.files, store)
    multipleFileUploadRef.value.value = undefined
}
const saveAnnotation = async () => {
    const currentAnnotation = await db.lastSelected
        .where('id')
        .equals(1)
        .first()
    if (currentAnnotation) {
        const content = await loadAnnotations(currentAnnotation)
        const annotationFile = await db.annotations
            .where('id')
            .equals(currentAnnotation.annotationId)
            .first()
        if (
            content &&
            content.length > 1 &&
            annotationFile &&
            annotationFile.name
        ) {
            const type = { 'text/csv': ['.csv'] }
            download(content, 'text/csv', type, annotationFile.name)
        }
    }
}
const loadAnnotations = async (currentAnnotation: { annotationId: number }) => {
    if (currentAnnotation) {
        const annotations = await db.annoData
            .where('annotationId')
            .equals(currentAnnotation.annotationId)
            .sortBy('timestamp')

        const annotationsLabeled = []

        for (const annotation of annotations) {
            annotationsLabeled.push({
                ...annotation,
                label: await db.labels.get(annotation.labelId),
            })
        }

        const data = [['Timestamp', 'Label']]

        for (const annotationLabeled of annotationsLabeled) {
            if (!annotationLabeled.label) continue

            data.push([
                DateTime.fromMillis(annotationLabeled.timestamp).toFormat(
                    'yyyy-MM-dd HH:mm:ss.SSS',
                ),
                annotationLabeled.label.name,
            ])
        }

        return stringify(data)
    }
}

// lifecycle
onMounted(() => {
    const popoverTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="popover"]'),
    )
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new $bootstrap.Popover(popoverTriggerEl)
    })
})
</script>

<style scoped>
@media (max-width: 768px) {
    ul {
        justify-content: center;
    }
}

.row {
    padding-top: 10px;
    border-bottom: solid gray;
}

li {
    margin: 5px;
}
</style>
