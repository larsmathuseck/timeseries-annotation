<template>
    <div class="row justify-content-between">
        <div id="col-header-title" class="col col-lg-auto col-md-auto col-sm-12 col-12">
            <label class="title">{{ title }}</label>
        </div>
        <div id="col-header-buttons" class="col col-lg-auto col-md-auto col-sm-12 col-12">
            <ul class="nav nav-pills">
                <li class="nav-item">
                    <button type="button" class="btn btn-light" @click="testDanfo">
                            Test Danfo
                    </button>
                </li>
                <li class="nav-item">
                    <input id="multipleFileUpload" type="file" webkitdirectory directory multiple v-on:change="onFileChange" hidden>
                    <button @click="chooseFiles()" type="button" class="btn btn-light">
                        <i class="fa fa-folder"></i>
                        Import Folder
                    </button>
                </li>
                <li class="nav-item">
                    <button type="button" class="btn btn-light" @click="saveAnnotation">
                        <i class="fa fa-download"></i>
                        Save Annotation
                    </button>
                </li>
                <li class="nav-item">
                    <button @click="toggleModelModalVisibility  = !toggleModelModalVisibility" type="button" class="btn btn-light">
                        <i class="fa fa-wrench"></i>
                        Model
                    </button>
                    <ImportModelModal :toggleModelModalVisibility="toggleModelModalVisibility" />
                </li>
                <li class="nav-item">
                    <button type="button" class="btn btn-light" @click="toggleTutorialModalVisibility  = !toggleTutorialModalVisibility">
                        <i class="fa fa-file"></i>
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

export default {
    name: "Header",
    components: {
        TutorialModal,
        ImportModelModal,
    },
    props: {
        title: String,
    },
    data() {
        return {
            toggleTutorialModalVisibility: false,
            toggleModelModalVisibility: false,
        }
    },
    methods: {
        testDanfo: function() {
            this.$store.commit("testDanfo");
        },
        chooseFiles() {
            document.getElementById("multipleFileUpload").click()
        },
        onFileChange(e) {
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
                        this.$store.commit("addAnnotationData", {result: reader.result, name: fileName});
                    }
                }
            }
        },
        async saveAnnotation() {
            let content = this.$store.getters.saveAnnotations;
            let name = this.$store.state.annotations[this.$store.state.currAnn]?.name;
            if(content.length > 1 && name != undefined){
                if (typeof showSaveFilePicker === 'undefined'){
                    var a = document.createElement("a");
                    a.href = window.URL.createObjectURL(new Blob([content], {type: "text/csv"}));
                    a.download = name;
                    a.click();
                }
                else{
                    try{
                        const fileHandle = await self.showSaveFilePicker({
                            suggestedName: name,
                            types: [{
                                description: 'CSV documents',
                                accept: {
                                'text/csv': ['.csv'],
                                },
                            }],
                        });
                        console.log(fileHandle);
                        const fileStream = await fileHandle.createWritable();
                        await fileStream.write(new Blob([content], {type: "text/csv;charset=utf-8;"}));
                        await fileStream.close();
                    } catch(error){
                        console.log(error);
                    }
                }
            }
        },
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

.title {
    font-size: 2.5vw;
}
</style>