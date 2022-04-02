<template>
    <div class="container">
        <div class="row" id="icon-row">
            <i class="fa-solid fa-chart-column"></i>
        </div>
        <div class="row mt-3">
            <div class="col">
                <h1>Import Data to get started</h1>
                <input id="folderUpload" type="file" webkitdirectory directory multiple v-on:change="onFolderChange" hidden>
                <button type="button" @click="chooseFolder" class="btn btn-light main-btn me-2">
                    <i class="fa-solid fa-folder"></i>
                    Import Folder
                </button>
                <p>or</p>
                <input id="fileUpload" type="file" accept=".csv" multiple v-on:change="onFileChange" hidden>
                <button type="button" @click="chooseFile" class="btn main-btn ms-2">
                    <i class="fa-solid fa-file"></i>
                    Import Files
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { readDataFiles } from "../../util/inputOutput.js";
import { loadFolder } from "../../util/inputOutput.js";

export default {
    name: "ImportGraph",
    methods: {
        chooseFolder() {
            document.getElementById("folderUpload").click();
        },
        onFolderChange(e) {
            loadFolder(e.target.files);
            document.getElementById("folderUpload").value = "";
        },
        chooseFile() {
            document.getElementById("fileUpload").click();
        },
        onFileChange(e) {
            readDataFiles(e.target.files);
            document.getElementById("fileUpload").value = "";
        },
    }
}
</script>

<style scoped>
#icon-row {
    padding-top: 20%
}

p {
    display: inline;
}

.fa-chart-column {
    font-size: 5rem;
}
</style>