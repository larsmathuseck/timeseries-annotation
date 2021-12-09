<template>
    <div class="row justify-content-between">
        <div id="col-header-title" class="col col-lg-auto col-md-auto col-sm-12 col-12">
            <h1>{{ title }}</h1>
        </div>
        <div id="col-header-buttons" class="col col-lg-auto col-md-auto col-sm-12 col-12">
            <ul class="nav nav-pills">
                <li class="nav-item">
                    <input id="fileUpload" type="file" webkitdirectory directory multiple v-on:change="onFileChange" hidden>
                    <button @click="chooseFiles()" type="button" class="btn btn-light">
                        <i class="fa fa-folder"></i>
                        Import Folder
                    </button>
                </li>
                <li class="nav-item">
                    <button type="button" class="btn btn-light">
                        <i class="fa fa-download"></i>
                        Save File
                    </button>
                </li>
                <li class="nav-item">
                    <button type="button" class="btn btn-light">
                        <i class="fa fa-file"></i>
                        Tutorial
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>


<script>
export default {
    name: "Header",
    props: {
        title: String,
    },
    methods: {
        chooseFiles() {
            document.getElementById("fileUpload").click()
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
    margin-bottom: 20px;
    margin-top: 10px;
    border-bottom: solid gray;
}

li {
    margin: 5px;
}

button {
    background-color: #e1e1e5;
}
</style>