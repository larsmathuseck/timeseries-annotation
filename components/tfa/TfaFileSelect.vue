<template>
    <div>
        <select
            ref="selectRef"
            v-model="lastSelected"
            class="form-select"
            @change="selectFile()"
        >
            <option v-for="row in data" :key="row.id" :value="row.id">
                {{ row.name }}
            </option>
        </select>
        <div class="input-group-apend my-auto">
            <button
                type="button"
                class="btn btn-default btn-circle me-1"
                @click="deleteFile()"
            >
                <i class="fa-solid fa-trash"></i>
            </button>
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
                class="btn btn-default btn-circle"
                @click="chooseFile()"
            >
                <i class="fa-solid fa-plus"></i>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { db } from '../../db'
import { deleteAnnotationFile } from '../../util/annotation.js'
import { readDataFiles } from '../../util/inputOutput.js'

interface Props {
    data: Record<number, { id: string | number; name: string }>
    selected: number
    type: string
}
const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
    showAnnotationModal: []
}>()

const store = useTfAnnotatorStore()

// refs
const fileUploadRef = ref()
const selectRef = ref()

// data
const lastSelected = ref(props.selected)

// methods
const selectFile = () => {
    if (props.type === 'data') {
        store.selectDataFile(lastSelected.value)
    } else if (props.type === 'annotation') {
        db.lastSelected.update(1, {
            annotationId: parseInt(selectRef.value.value),
        })
    }
}
const chooseFile = () => {
    if (props.type === 'data') {
        fileUploadRef.value?.click()
    } else if (props.type === 'annotation') {
        emit('showAnnotationModal')
    }
}
const onFileChange = (e: Event) => {
    if (!e.target || !(e.target instanceof HTMLInputElement) || !e.target.files)
        return

    readDataFiles(e.target.files, store)

    if (fileUploadRef.value) {
        fileUploadRef.value.value = ''
    }
}
const deleteFile = async () => {
    if (props.type === 'data') {
        store.removeData()
    } else if (props.type === 'annotation') {
        await deleteAnnotationFile()
    }
}

// lifecycle
watch(
    () => props.selected,
    (value) => (lastSelected.value = value),
)
</script>

<style scoped>
.form-select {
    margin-right: 10px;
}
</style>
