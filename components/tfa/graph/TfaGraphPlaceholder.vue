<template>
    <div class="container">
        <div id="icon-row" class="row">
            <i class="fa-solid fa-chart-column"></i>
        </div>
        <div class="row mt-3">
            <div class="col">
                <h1>Import Data to get started</h1>
                <input
                    ref="folderUploadRef"
                    type="file"
                    webkitdirectory
                    directory
                    multiple
                    hidden
                    @change="onFolderChange"
                />
                <button
                    type="button"
                    class="btn btn-light main-btn me-2"
                    @click="chooseFolder"
                >
                    <i class="fa-solid fa-folder"></i>
                    Import Folder
                </button>
                <p>or</p>
                <input
                    ref="fileUploadRef"
                    type="file"
                    accept=".csv"
                    multiple
                    hidden
                    @change="onFileChange"
                />
                <button
                    type="button"
                    class="btn main-btn ms-2"
                    @click="chooseFile"
                >
                    <i class="fa-solid fa-file"></i>
                    Import Files
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { readDataFiles, loadFolder } from '../../../util/inputOutput.js'

const store = useTfAnnotatorStore()

const fileUploadRef = ref<HTMLInputElement>()
const folderUploadRef = ref<HTMLInputElement>()

const chooseFolder = () => folderUploadRef.value?.click()
const onFolderChange = (e: Event) => {
    if (!e.target || !(e.target instanceof HTMLInputElement) || !e.target.files)
        return

    loadFolder(e.target.files, store)

    if (folderUploadRef.value) {
        folderUploadRef.value.value = ''
    }
}
const chooseFile = () => {
    document.getElementById('fileUpload')?.click()
}
const onFileChange = (e: Event) => {
    if (!e.target || !(e.target instanceof HTMLInputElement) || !e.target.files)
        return

    readDataFiles(e.target.files, store)

    if (fileUploadRef.value) {
        fileUploadRef.value.value = ''
    }
}
</script>

<style scoped>
#icon-row {
    padding-top: 20%;
}

p {
    display: inline;
}

.fa-chart-column {
    font-size: 5rem;
}
</style>
