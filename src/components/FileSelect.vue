<template>
    <select v-model="lastSelected" ref="select" class="form-select" @change="selectFile()">
        <option v-for="row in data" :key="row.id" v-bind:value="row.id">
            {{ row.name }}
        </option>
    </select>
    <div class="input-group-apend">
        <input id="fileUpload" type="file" accept=".csv" multiple v-on:change="onFileChange" hidden>
        <button type="button" class="btn btn-default btn-circle" @click="chooseFile()">
            <i class="fa fa-plus"></i>
        </button>
    </div>
</template>

<script>
import { db } from "/db"

export default {
    name: "FileSelect",
    components: {
        
    },
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
    },
    watch: {
        selected: function() {
            this.lastSelected = this.selected;
        }
    }
}
</script>

<style scoped>
.btn-circle {
    height: 2.5vw;
    width: 2.5vw;
    border-radius: 1.25vw;
    text-align: center;
    font-size: 1vw;
    background-color: #bbb;
    opacity: 0.7;
    margin-left: 1vw;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0px;
}

.btn-circle:hover { 
    opacity: 1;
}

.fa-plus {
    max-height: fit-content;
    max-width: fit-content;
    display:inline-block;
    text-align: center;
    vertical-align: bottom;
}
</style>
