<template>
    <div class="row justify-content-between">
        <div id="col-header-title" class="col col-lg-auto col-md-auto col-sm-12 col-12">
            <h1>{{ title }}</h1>
        </div>
        <div id="col-header-buttons" class="col col-lg-auto col-md-auto col-sm-12 col-12">
            <ul class="nav nav-pills">
                <li class="nav-item">
                    <input id="fileUpload" type="file" v-on:change="onFileChange" hidden>
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
/**
<div class="col col-lg-2">
            <input id="fileUpload" type="file" hidden>
                <button @click="chooseFiles()" type="button" class="btn btn-light">
                    <i class="fa fa-folder"></i>
                    Import Folder
                </button>
        </div>
        <div class="col col-lg-2">
            Save
        </div>
        <div class="col col-lg-2">
            Tutorial
        </div>


    <header class="d-flex flex-wrap justify-content-left border-bottom">
        <h1>{{ title }}</h1>
        <ul class="nav nav-pills">
            <li class="nav-item">
                <input id="fileUpload" type="file" hidden>
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
    </header>
*/
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
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                this.$store.commit("loadData", reader.result);
            };
            reader.readAsText(file);
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
</style>