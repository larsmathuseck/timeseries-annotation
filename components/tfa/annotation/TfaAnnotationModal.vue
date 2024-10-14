<template>
    <div
        ref="annotationModalRef"
        class="modal fade"
        tabindex="-1"
        aria-hidden="false"
    >
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        Import or Add new Annotation File
                    </h5>
                    <button
                        type="button"
                        class="btn-close"
                        aria-label="Close"
                        @click="closeModal"
                    ></button>
                </div>
                <div class="form-container">
                    <div class="modal-body">
                        <div class="row justify-content-md-center">
                            <div class="col-10 d-flex justify-content-center">
                                <div class="row">
                                    <label class="modal-description-text">
                                        Import existing Annotation File:
                                    </label>
                                </div>
                            </div>
                            <div class="col-2 ps-0">
                                <input
                                    ref="annotationFileUploadRef"
                                    type="file"
                                    accept=".csv"
                                    multiple
                                    hidden
                                    @change="onAnnotationFileChange"
                                />
                                <button
                                    type="button"
                                    class="btn btn-default btn-circle"
                                    @click="chooseAnnotationFile"
                                >
                                    <i class="fa-solid fa-folder"></i>
                                </button>
                            </div>
                        </div>
                        <div
                            v-show="error?.length"
                            class="row justify-content-md-center"
                        >
                            <div class="col-auto">
                                <div class="alert alert-danger" role="alert">
                                    {{ error }}
                                </div>
                            </div>
                        </div>
                        <div class="separator">or</div>
                        <div class="row justify-content-md-center">
                            <div class="col-auto">
                                <label class="modal-description-text">
                                    Create a new Annotation File:
                                </label>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-auto text-start">
                                <label
                                    for="inputFileName"
                                    class="form-label description-text-sm"
                                    >File Name:</label
                                >
                                <input
                                    id="inputFileName"
                                    v-model="fileName"
                                    type="text"
                                    class="form-control"
                                    required
                                />
                            </div>
                        </div>
                        <div
                            v-show="showInvalidFeedback"
                            class="row justify-content-md-center"
                        >
                            <div class="col-auto">
                                <div class="alert alert-danger" role="alert">
                                    The file has to contain "annotation" or
                                    "labels" in its name!
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button
                            type="button"
                            class="btn btn-secondary"
                            @click="closeModal"
                        >
                            Close
                        </button>
                        <button
                            id="submitButton"
                            class="btn btn-primary"
                            type="submit"
                            @click="onSubmit"
                        >
                            Add Annotation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { db } from '../../../db'
import { addAnnotationData } from '../../../util/annotation'

interface Props {
    toggleModalVisibility: boolean
}
const props = withDefaults(defineProps<Props>(), {})

const { $bootstrap } = useNuxtApp()
const store = useTfAnnotatorStore()

// refs
const annotationModalRef = ref()
const annotationFileUploadRef = ref()

// data
const modal = ref()
const fileName = ref<string>()
const error = ref<string>()
const showInvalidFeedback = ref(false)

// methods
const closeModal = () => {
    if (modal.value) {
        modal.value.hide()
    }
}
const chooseAnnotationFile = () => {
    annotationFileUploadRef.value?.click()
}
const onAnnotationFileChange = (e: Event) => {
    if (!e.target || !(e.target instanceof HTMLInputElement) || !e.target.files)
        return

    const fileList = e.target.files
    let annotationFileImported = false
    for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
        const reader = new FileReader()
        const file = fileList[i]
        if (
            file.name[0] !== '.' &&
            (file.type.toLowerCase().includes('text') ||
                file.type.toLowerCase().includes('excel'))
        ) {
            reader.readAsText(file)
            reader.onload = () => {
                if (
                    (file.name.toLowerCase().includes('annotation') ||
                        file.name.toLowerCase().includes('labels')) &&
                    typeof reader.result === 'string'
                ) {
                    addAnnotationData(reader.result, file.name, store.colors)
                    annotationFileImported = true
                }
                if (!annotationFileImported) {
                    // check if file is correct if not show error
                    error.value =
                        'The chosen file has to contain "annotation" or "labels" in its name!'
                } else {
                    error.value = ''
                    modal.value?.hide()
                }
            }
        }
    }
    annotationFileUploadRef.value = undefined // reset file input so when same file chosen again its an "onChange"
}
const onSubmit = async (e: Event) => {
    e.preventDefault()
    if (
        !fileName.value?.toLowerCase().includes('annotation') &&
        !fileName.value?.toLowerCase().includes('labels')
    ) {
        showInvalidFeedback.value = true
        return
    }
    const filename = fileName.value + '.csv'
    const anno = await db.annotations.add({ name: filename, lastAdded: null })
    db.lastSelected.put({ id: 1, annotationId: anno })
    store.labelActive = undefined
    modal.value?.hide()
}

// lifecycle
onMounted(() => {
    modal.value = new $bootstrap.Modal(annotationModalRef.value)
})
watch(
    () => props.toggleModalVisibility,
    () => {
        fileName.value = undefined
        error.value = undefined
        showInvalidFeedback.value = false
        if (modal.value) {
            modal.value.show()
        }
    },
)
</script>

<style scoped>
.modal-description-text {
    font-size: 14px;
    align-self: center;
}

.btn-circle {
    height: 30px;
    width: 30px;
    border-radius: 15px;
    text-align: center;
    font-size: 12px;
    background-color: #bbb;
    opacity: 0.7;
    padding: 0px;
}

.separator {
    display: flex;
    align-items: center;
    text-align: center;
    font-size: 12px;
}

.separator::before,
.separator::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid grey;
}

.alert-danger {
    margin-top: 10px;
    margin-bottom: 10px;
}
</style>
