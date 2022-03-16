<template>
    <select v-model="lastSelected" ref="select" class="form-select" @change="selectFile()">
        <option v-for="row in data" :key="row.id" v-bind:value="row.id">
            {{ row.name }}
        </option>
    </select>
    <div class="input-group-apend my-auto">
        <input id="fileUpload" type="file" accept=".csv" multiple v-on:change="onFileChange" hidden>
        <button v-if="type =='annotation'" type="button" class="btn btn-default btn-circle trash-btn me-1" @click="deleteFile()">
            <i class="fa fa-trash"></i>
        </button>
        <button type="button" class="btn btn-default btn-circle" @click="chooseFile()">
            <i class="fa fa-plus"></i>
        </button>
        
    </div>
</template>

<script>
import { db } from "/db"

export default {
    name: "FileSelect",
    props: {
        type: String,
        data: Array,
        selected: Number,
    },
    emits: ['annoModal'],
    data() {
        return {
            lastSelected: this.selected,
        }
    },
    methods: {
        selectFile(){
            if(this.type == "data"){
                this.$store.commit("selectDataFile", this.lastSelected);
            }
            else if(this.type == "annotation"){
                db.lastSelected.update(1, {annoId: parseInt(this.$refs.select.value)});
            }
        },
        chooseFile(){
            if(this.type == "data"){
                document.getElementById("fileUpload").click();
            }
            else if(this.type == "annotation"){
                this.$emit("annoModal");
            }
        },
        onFileChange(e) {
            const fileList = e.target.files;
            for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
                const file = fileList[i];
                this.readFile(file);
            }
        },
        readFile(file){
            const reader = new FileReader();
            if(file.name[0] != '.' && (file.type.includes("text") || file.type.includes("excel"))) {
                reader.readAsText(file);
                reader.onload = () => {
                    if(file.name.includes("data")){
                        this.$store.commit("addData", {result: reader.result, name: file.name});
                    }
                }
            }
        },
        async deleteFile() {
            const anno = await db.lastSelected.where('id').equals(1).first();
            const annoId = anno.annoId;
            await db.annotations.delete(annoId);
            db.annoData.where("annoId").equals(annoId).delete();
            db.labels.where("annoId").equals(annoId).delete();
            db.areas.where("annoId").equals(annoId).delete();
            const annotations = await db.annotations.toArray();
            if (annotations.length != 0) {
                db.lastSelected.update(1, {annoId: parseInt(annotations[0].id)});
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
    margin-right: 0.7vw;
}

.btn-circle {
    height: 2vw;
    width: 2vw;
    border-radius: 1vw;
    text-align: center;
    font-size: 0.7vw;
    background-color: #bbb;
    opacity: 0.7;
    margin-top: auto;
    margin-bottom: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0px;
}

.btn-circle:hover { 
    opacity: 1;
}

.trash-btn {
    font-size: 1vw;
}

.fa-plus {
    max-height: fit-content;
    max-width: fit-content;
    display:inline-block;
    text-align: center;
    vertical-align: bottom;
}
</style>
