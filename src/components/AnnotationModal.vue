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
                            <div class="col-auto">
                                <label>
                                    Import existing Annotation File:
                                </label>
                                <input id="annotationFileUpload" type="file" accept=".csv" multiple v-on:change="onAnnotationFileChange" hidden>
                                <button type="button" class="btn btn-default btn-circle" @click="chooseAnnotationFile">
                                    <i class="fa fa-folder"></i>
                                </button>
                            </div>
                        </div>
                        <div class="row justify-content-md-center" v-show="this.error != ''">
                            <div id="allert-div" class="col-auto">
                                <div class="alert alert-danger" role="alert">
                                    {{ this.error }}
                                </div>
                            </div>
                        </div>
                        <div class="separator">or</div>
                        <div class="row justify-content-md-center">
                            <div class="col-auto">
                                <label>Create a new Annotation File:</label>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-auto text-start">
                                <label for="inputFileName" class="form-label description-text-sm">File Name:</label>
                                <input type="text" v-model="fileName" class="form-control" id="inputFileName" required>
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
import { Modal } from 'bootstrap'

export default {
    name: "AnnotationModal",
    props: {
        toggleModalVisibility: Boolean,
        annotationModalKey: Number,
    },
    data() {
        return {
            modal: null,
            fileName: "",
            error: "",
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
            console.log("annotationFilechange called");
            const fileList = e.target.files;
            let annotationFileImported = false;
            for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
                const reader = new FileReader();
                const file = fileList[i];
                if(file.name[0] != '.' && (file.type.includes("text") || file.type.includes("excel"))) {
                    reader.readAsText(file);
                    reader.onload = () => {
                        if(file.name.includes("annotation") || file.name.includes("labels")){
                            this.$store.commit("addAnnotationData", {result: reader.result, name: file.name});
                            this.annotationFileImported = true;
                        }
                    }
                }
            }
            if (!annotationFileImported) {
                this.error = "The chosen file has to contain \"annotation\" or \"annotation\" in its name!"
                console.log(this.error)
            } else {
                console.log("upload success, modal close")
                this.modal.hide();
            }
        },
        onSubmit(e) {
            e.preventDefault();
            this.$store.commit("addAnnotationFile", this.fileName);
        },
    },
    watch: {
        toggleModalVisibility: function() {
            this.modal.show();
        },
    },

    mounted() {
        this.modal = new Modal(this.$refs.annotationModal)
    },
}
</script>

<style scoped>
.btn-circle {
    height: 2.5vw;
    width: 2.5vw;
    border-radius: 1.25vw;
    text-align: center;
    font-size: 1vw;
    background-color: #bbb;
    opacity: 0.7;
    margin-left: 1vw;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0px;
}

.btn-circle:hover { 
    opacity: 1;
}

.separator {
    display: flex;
    align-items: center;
    text-align: center;
    font-size: 1.2vw;
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