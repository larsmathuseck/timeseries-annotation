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
export default {
    name: "ImportGraph",
    methods: {
        chooseFolder: function() {
            document.getElementById("folderUpload").click();
        },
        onFolderChange: function(e) {
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
                // create same file again but with correct name because file.name = ... is not allowed
                const blob = file.slice(0, file.size, file.type);
                const newFile = new File([blob], fileName, {type: file.type, webkitRelativePath: file.webkitRelativePath});
                this.readFile(newFile);
            }
            document.getElementById("folderUpload").value = "";
        },
        chooseFile: function() {
            document.getElementById("fileUpload").click();
        },
        onFileChange: function(e) {
            const fileList = e.target.files;
            for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
                const file = fileList[i];
                this.readFile(file);
            }
            document.getElementById("fileUpload").value = "";
        },
        readFile: function(file) {
            const reader = new FileReader();
            if(file.name[0] != '.' && (file.type.includes("text") || file.type.includes("excel"))) {
                reader.readAsText(file);
                reader.onload = () => {
                    if(file.name.includes("data")) {
                        this.$store.commit("addData", {result: reader.result, name: file.name});
                    }
                }
            }
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