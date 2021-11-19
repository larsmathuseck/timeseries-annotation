<template>
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
        }
    },
}
</script>

<style scoped>
header {
    justify-content: space-between;
    margin-bottom: 20px;
}

li {
    margin: 5px;
}


</style>