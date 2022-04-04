<template>
    <select v-model="lastSelected" ref="select" class="form-select" @change="selectFile()">
        <option v-for="row in data" :key="row.id" v-bind:value="row.id">
            {{ row.name }}
        </option>
    </select>
    <div class="input-group-apend my-auto">
        <button type="button" class="btn btn-default btn-circle me-1" @click="deleteFile()">
            <i class="fa-solid fa-trash"></i>
        </button>
        <input id="fileUpload" type="file" accept=".csv" multiple v-on:change="onFileChange" hidden>
        <button type="button" class="btn btn-default btn-circle" @click="chooseFile()">
            <i class="fa-solid fa-plus"></i>
        </button>
    </div>
</template>

<script>
import { db } from "/db";
import { deleteAnnotationFile } from "../util/DatabankManager";
import { readDataFiles } from "../util/inputOutput.js";

export default {
    name: "FileSelect",
    props: {
        type: String,
        data: Object,
        selected: Number,
    },
    data() {
        return {
            lastSelected: this.selected,
        }
    },
    methods: {
        selectFile() {
            if(this.type == "data") {
                this.$store.commit("selectDataFile", this.lastSelected);
            }
            else if(this.type == "annotation") {
                db.lastSelected.update(1, {annoId: parseInt(this.$refs.select.value)});
            }
        },
        chooseFile() {
            if(this.type == "data") {
                document.getElementById("fileUpload").click();
            }
            else if(this.type == "annotation") {
                this.$emit("showAnnotationModal");
            }
        },
        onFileChange(e) {
            readDataFiles(e.target.files);
            document.getElementById("fileUpload").value = "";
        },
        async deleteFile() {
            if(this.type == "data") {
                this.$store.commit("deleteData", this.lastSelected);
            }
            else if(this.type == "annotation") {
                await deleteAnnotationFile();
            }
        }
    },
    watch: {
        selected() {
            this.lastSelected = this.selected;
        }
    },
    emits: ["showAnnotationModal"]
}
</script>

<style scoped>
.form-select {
    margin-right: 10px;
}
</style>
