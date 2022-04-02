<template>
    <div class="row justify-content-between">
        <div id="col-header-title" class="col col-md-auto col-12">
            <h1>{{ title }}</h1>
        </div>
        <div id="col-header-buttons" class="col col-md-auto col-12">
            <ul class="nav nav-pills">
                <li class="nav-item">
                    <input id="multipleFileUpload" type="file" webkitdirectory directory multiple v-on:change="onFileChange" hidden>
                    <button type="button" @click="chooseFiles" class="btn btn-light main-btn" data-bs-toggle="popover" data-bs-trigger="hover" data-bs-placement="bottom" data-bs-content="All unsaved changes will be lost">
                        <i class="fa-solid fa-folder"></i>
                        Import Folder
                    </button>
                </li>
                <li class="nav-item">
                    <button type="button" class="btn btn-light main-btn" @click="saveAnnotation">
                        <i class="fa-solid fa-download"></i>
                        Save Annotation
                    </button>
                </li>
                <li class="nav-item">
                    <button type="button" @click="toggleModelModalVisibility  = !toggleModelModalVisibility" class="btn btn-light main-btn">
                        <i class="fa-solid fa-wrench"></i>
                        Model
                    </button>
                    <ImportModelModal :toggleModelModalVisibility="toggleModelModalVisibility" />
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import ImportModelModal from "../components/ImportModelModal.vue";
import { loadFolder } from "../util/inputOutput.js";
import { download } from "../util/inputOutput.js";
import { db } from "/db";
import { DateTime } from "luxon";
import { stringify } from "@vanillaes/csv";
import { Popover } from "bootstrap";

export default {
    name: "Header",
    components: {
        ImportModelModal,
    },
    props: {
        title: String,
    },
    data() {
        return {
            toggleModelModalVisibility: false,
        }
    },
    methods: {
        chooseFiles() {
            document.getElementById("multipleFileUpload").click();
        },
        onFileChange(e) {
            loadFolder(e.target.files);
            document.getElementById("multipleFileUpload").value = "";
        },
        async saveAnnotation() {
            const currAnn = await db.lastSelected.where('id').equals(1).first();
            if (currAnn) {
                const content = await this.loadAnnotations(currAnn);
                const annotationFile = await db.annotations.where('id').equals(currAnn.annoId).first();
                if(content.length > 1 && annotationFile.name) {
                    let type = {'text/csv': ['.csv']};
                    download(content, "text/csv", type, annotationFile.name);
                }
            }
        },
        async loadAnnotations(currAnn) {
            if (currAnn) {
                const annotations = await db.annoData.where('annoId').equals(parseInt(currAnn.annoId)).sortBy('timestamp');
                await Promise.all (annotations.map (async anno => {
                    [anno.label] = await Promise.all([
                        db.labels.get(anno.labelId)
                    ]);
                }));
                let data = [["Timestamp", "Label"]];
                annotations.forEach(anno => {
                    data.push([DateTime.fromMillis(anno.timestamp).toFormat('yyyy-MM-dd hh:mm:ss.SSS'), anno.label.name]);
                });
                return stringify(data);
            }
            return [];
        }
    },
    mounted() {
        var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
        popoverTriggerList.map(function (popoverTriggerEl) {
            return new Popover(popoverTriggerEl)
        })
    },
}
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