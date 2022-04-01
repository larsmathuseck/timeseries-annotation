<template>
    <div class="modal fade" ref="annotationModal" tabindex="-1" aria-hidden="false">
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Import or Add new Annotation File</h5>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>
                <form class="form-container" @submit="onSubmit">
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
                                <input id="annotationFileUpload" type="file" accept=".csv" multiple v-on:change="onAnnotationFileChange" hidden>
                                <button type="button" class="btn btn-default btn-circle" @click="chooseAnnotationFile">
                                    <i class="fa-solid fa-folder"></i>
                                </button>
                            </div>
                        </div>
                        <div class="row justify-content-md-center" v-show="this.error != ''">
                            <div class="col-auto">
                                <div class="alert alert-danger" role="alert">
                                    {{ this.error }}
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
                                <label for="inputFileName" class="form-label description-text-sm">File Name:</label>
                                <input type="text" v-model="fileName" class="form-control" id="inputFileName" required>
                            </div>
                        </div>
                        <div class="row justify-content-md-center" v-show="showInvalidFeedback">
                            <div class="col-auto">
                                <div class="alert alert-danger" role="alert">
                                    The file has to contain "annotation" or "labels" in its name!
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary"  @click="closeModal">Close</button>
                        <button id="submitButton" class="btn btn-primary" type="submit">Add Annotation</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { Modal } from 'bootstrap';
import { db } from "/db";
import { addAnnotationData } from "../util/DatabankManager";

export default {
    name: "AnnotationModal",
    props: {
        toggleModalVisibility: Boolean,
    },
    data() {
        return {
            modal: null,
            fileName: "",
            error: "",
            showInvalidFeedback: false,
        }
    },
    methods: {
        closeModal: function() {
            this.modal.hide();
        },
        chooseAnnotationFile() {
            document.getElementById("annotationFileUpload").click()
        },
        onAnnotationFileChange(e) {
            const fileList = e.target.files;
            let annotationFileImported = false;
            for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
                const reader = new FileReader();
                const file = fileList[i];
                if(file.name[0] != '.' && (file.type.includes("text") || file.type.includes("excel"))) {
                    reader.readAsText(file);
                    reader.onload = () => {
                        if(file.name.includes("annotation") || file.name.includes("labels")){
                            addAnnotationData(reader.result, file.name, this.$store.state.colors);
                            annotationFileImported = true;
                        }
                        if (!annotationFileImported) { // check if file is correct if not show error 
                            this.error = "The chosen file has to contain \"annotation\" or \"labels\" in its name!";
                        } else {
                            this.error = "";
                            this.modal.hide();
                        }
                    }
                }
            }
            document.getElementById("annotationFileUpload").value = ""; // reset file input so when same file chosen again its an "onChange"
        },
        async onSubmit(e) {
            e.preventDefault();
            if(!this.fileName.toLowerCase().includes("annotation") && !this.fileName.toLowerCase().includes("labels")) {
                this.showInvalidFeedback = true;
                return;
            }
            const filename = this.fileName + '.csv';
            const anno = await db.annotations.add({name: filename, lastAdded: null});
            db.lastSelected.put({id: 1, annoId: anno});
            this.$store.state.activeLabel = null;
            this.modal.hide();
        },
    },
    watch: {
        toggleModalVisibility: function() {
            this.fileName = ""; 
            this.error = "";
            this.showInvalidFeedback = false;
            this.modal.show();
        },
    },

    mounted() {
        this.modal = new Modal(this.$refs.annotationModal)
    },
}
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