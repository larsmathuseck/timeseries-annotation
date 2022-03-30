<template>
    <div class="row justify-content-between">
        <div id="col-header-title" class="col col-lg-auto col-md-auto col-sm-12 col-12">
            <h1>{{ title }}</h1>
        </div>
        <div id="col-header-buttons" class="col col-lg-auto col-md-auto col-sm-12 col-12">
            <ul class="nav nav-pills">
                <li class="nav-item">
                    <input id="multipleFileUpload" type="file" webkitdirectory directory multiple v-on:change="onFileChange" hidden>
                    <button type="button" @click="chooseFiles" class="btn btn-light" data-bs-toggle="popover" data-bs-trigger="hover" data-bs-placement="bottom" data-bs-content="All unsaved changes will be lost">
                        <i class="fa-solid fa-folder"></i>
                        Import Folder
                    </button>
                </li>
                <li class="nav-item" v-if="!debug">
                    <button type="button" class="btn btn-light" @click="saveAnnotation">
                        <i class="fa-solid fa-download"></i>
                        Save Annotation
                    </button>
                </li>
                <li class="nav-item" v-if="!debug">
                    <button @click="toggleModelModalVisibility  = !toggleModelModalVisibility" type="button" class="btn btn-light">
                        <i class="fa-solid fa-wrench"></i>
                        Model
                    </button>
                    <ImportModelModal :toggleModelModalVisibility="toggleModelModalVisibility" />
                </li>
                <li class="nav-item" v-if="!debug">
                    <button type="button" class="btn btn-light" @click="toggleTutorialModalVisibility  = !toggleTutorialModalVisibility">
                        <i class="fa-solid fa-file"></i>
                        Tutorial
                    </button>
                    <TutorialModal :toggleTutorialModalVisibility="toggleTutorialModalVisibility" />
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import TutorialModal from "../components/TutorialModal.vue";
import ImportModelModal from "../components/ImportModelModal.vue";
import { db } from "/db";
import { DateTime } from "luxon";
import { stringify } from "@vanillaes/csv";
import { Popover } from "bootstrap";
import { addAnnotationData } from "../util/DatabankManager";

export default {
    name: "Header",
    components: {
        TutorialModal,
        ImportModelModal,
    },
    props: {
        title: String,
        debug: Boolean,
    },
    data() {
        return {
            toggleTutorialModalVisibility: false,
            toggleModelModalVisibility: false,
        }
    },
    methods: {
        chooseFiles() {
            document.getElementById("multipleFileUpload").click();
        },
        onFileChange(e) {
            db.annotations.clear();
            db.annoData.clear();
            db.labels.clear();
            db.areas.clear();
            const fileList = e.target.files;
            let filesToUpload = [];
            let fileNames = {};
            for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
                const file = fileList[i];
                if(file.name[0] != '.' && (file.type.includes("text") || file.type.includes("excel"))) {
                    filesToUpload.push(file);
                    if (fileNames[file.name] == undefined) {
                        fileNames[file.name] = 1;
                    } else {
                        fileNames[file.name] += 1;
                    }
                }
            }
            for (let i in filesToUpload) {
                const file = filesToUpload[i];
                let fileName = file.name;
                if (fileNames[file.name] > 1) {
                    const path = file.webkitRelativePath;
                    const directories = path.split("/");
                    fileName = directories.slice(-2)[0] + "/" + directories.slice(-1);
                }
                const reader = new FileReader();
                reader.readAsText(file);
                reader.onload = () => {
                    if(file.name.includes("data")){
                        this.$store.commit("addData", {result: reader.result, name: fileName});
                    }
                    else if(file.name.includes("annotation") || file.name.includes("labels")){
                        addAnnotationData(reader.result, file.name, this.$store.state.colors);
                    }
                }
            }
            document.getElementById("multipleFileUpload").value = "";
        },
        async saveAnnotation() {
            const currAnn = await db.lastSelected.where('id').equals(1).first();
            if (currAnn){
                const content = await this.loadAnnotations(currAnn);
                const annotationFile = await db.annotations.where('id').equals(currAnn.annoId).first();
                if(content.length > 1 && annotationFile.name){
                    if (typeof showSaveFilePicker === 'undefined'){
                        var a = document.createElement("a");
                        a.href = window.URL.createObjectURL(new Blob([content], {type: "text/csv"}));
                        a.download = annotationFile.name;
                        a.click();
                    }
                    else{
                        try{
                            const fileHandle = await self.showSaveFilePicker({
                                suggestedName: annotationFile.name,
                                types: [{
                                    description: 'CSV documents',
                                    accept: {
                                    'text/csv': ['.csv'],
                                    },
                                }],
                            });
                            const fileStream = await fileHandle.createWritable();
                            await fileStream.write(new Blob([content], {type: "text/csv;charset=utf-8;"}));
                            await fileStream.close();
                        } catch(error){
                            console.log(error);
                        }
                    }
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

button {
    background-color: #e1e1e5;
    font-size: 1vw;
}

h1 {
    font-size: 2.5vw;
}
</style>