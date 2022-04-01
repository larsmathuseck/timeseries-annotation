<template>
    <select v-model="lastSelected" ref="select" class="form-select" @change="selectFile()">
        <option v-for="row in data" :key="row.id" v-bind:value="row.id">
            {{ row.name }}
        </option>
    </select>
    <div class="input-group-apend my-auto">
        <input id="fileUpload" type="file" accept=".csv" multiple v-on:change="onFileChange" hidden>
        <button type="button" class="btn btn-default btn-circle me-1" @click="deleteFile()">
            <i class="fa-solid fa-trash"></i>
        </button>
        <button type="button" class="btn btn-default btn-circle" @click="chooseFile()">
            <i class="fa-solid fa-plus"></i>
        </button>
    </div>
</template>

<script>
import { db } from "/db"
import { deleteAnnotationFile } from "../util/DatabankManager"

export default {
    name: "FileSelect",
    props: {
        type: String,
        data: Object,
        selected: Number,
    },
    emits: ['annoModal'],
    data: function() {
        return {
            lastSelected: this.selected,
        }
    },
    methods: {
        selectFile: function() {
            if(this.type == "data") {
                this.$store.commit("selectDataFile", this.lastSelected);
            }
            else if(this.type == "annotation") {
                db.lastSelected.update(1, {annoId: parseInt(this.$refs.select.value)});
            }
        },
        chooseFile: function() {
            if(this.type == "data") {
                document.getElementById("fileUpload").click();
            }
            else if(this.type == "annotation") {
                this.$emit("annoModal");
            }
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
        deleteFile: async function() {
            if(this.type == "data") {
                this.$store.commit("deleteData", this.lastSelected);
            }
            else if(this.type == "annotation") {
                await deleteAnnotationFile();
            }
        }
    },
    watch: {
        selected: function() {
            this.lastSelected = this.selected;
        }
    }
}
</script>

<style scoped>
.form-select {
    margin-right: 10px;
}
</style>
