<template>
    <div class="row justify-content-between">
        <div id="col-header-title" class="col col-lg-auto col-md-auto col-sm-12 col-12">
            <h1>{{ title }}</h1>
        </div>
        <div id="col-header-buttons" class="col col-lg-auto col-md-auto col-sm-12 col-12">
            <ul class="nav nav-pills">
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
                        Save File
                    </button>
                </li>
                <li class="nav-item">
                    <button type="button" class="btn btn-light" @click="toggleModalVisibility  = !toggleModalVisibility">
                        <i class="fa fa-file"></i>
                        Tutorial
                    </button>
                        <TutorialModal :toggleModalVisibility="toggleModalVisibility" />
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import TutorialModal from "../components/TutorialModal.vue";

export default {
    name: "Header",
    components: {
        TutorialModal,
    },
    props: {
        title: String,
    },
    data() {
        return {
            toggleModalVisibility: false,
        }
    },
    methods: {
        chooseFiles() {
            document.getElementById("multipleFileUpload").click()
        },
        onFileChange(e) {
            const fileList = e.target.files;
            for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
                const reader = new FileReader();
                const file = fileList[i];
                if(file.name[0] != '.' && (file.type.includes("text") || file.type.includes("excel"))) {
                    reader.readAsText(file);
                    reader.onload = () => {
                        if(file.name.includes("data")){
                            this.$store.commit("addData", {result: reader.result, name: file.name});
                        }
                        else if(file.name.includes("annotation") || file.name.includes("labels")){
                            this.$store.commit("addAnnotationData", {result: reader.result, name: file.name});
                        }
                    }
                }
            }
        },
        async saveAnnotation() {
            // var a = document.createElement("a");
            // a.href = window.URL.createObjectURL(new Blob(["CONTENT"], {type: "text/plain"}));
            // a.download = "demo.txt";
            // a.click();
            const fileHandle = await window.showSaveFilePicker();
            const fileStream = await fileHandle.createWritable();
            await fileStream.write(new Blob(["CONTENT"], {type: "text/plain"}));
            await fileStream.close();
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

h1 {
    font-size: 2.5vw;
}
</style>