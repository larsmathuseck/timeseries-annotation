<template>
    <div class="row">
        <label class="description-text" >Data Files</label>
        <div class="input-group">
            <FileSelect type="data" :data="data" :selected="lastSelectedData" />
        </div>
    </div>
    <div class="row">
        <span class="description-text" >
            <label>Axes</label>
            <button type="button" class="btn btn-default btn-circle" @click="showAxesModal">
                <i class="fa-solid fa-plus"></i>
            </button>
        </span>
        <div id="scroll-container-axes">
            <div class="row axis-annotation-container" v-for="axis in this.axes" :key="axis.id" >
                <Axis :axis="axis" @editAxis="editAxis" :isSelected="(selectedAxes.indexOf(axis.id) > -1)" />
            </div>
        </div>
    </div>
    <div class="row">
        <label class="description-text" >Annotation Files</label>
        <div class="input-group">
            <FileSelect type="annotation" :data="annotationFiles" :selected="lastSelectedAnnotation" @annoModal="showAnnotationModal" />
        </div>
    </div>
    <div class="row">
        <span class="description-text" >
            <label>Labels</label>
            <button type="button" class="btn btn-default btn-circle" @click="showLabelModal">
                <i class="fa-solid fa-plus"></i>
            </button>
        </span>
        <div class="row justify-content-start align-items-center">
            <div class="col-auto area-visibility-container">
                <p id="area-p">Areas visible</p>
            </div>
            <div class="col-auto area-visibility-container px-0">
                <label class="switch">
                    <input type="checkbox" v-model="areasVisible" v-show="false">
                    <span class="slider round"></span>
                </label>
            </div>
        </div>
        <div id="scroll-container-labels">
            <div class="row axis-annotation-container" v-for="label in this.labels" :key="label.id" @click="labelOnClick(label)" >
                <Label :label="label" @editLabel="editLabel" />
            </div>
        </div>
    </div>
    <AnnotationModal :toggleModalVisibility="toggleAnnotationModalVisibility" />
    <LabelModal :addLabelKey="addLabelKey" :toggleModalVisibility="toggleLabelModalVisibility" :labelToEdit="labelToEdit" />
    <AxesModal :toggleModalVisibility="toggleAxesModalVisibility" :title="axisModalTitle" :axisToEdit="axisToEdit"/>
</template>

<script>
import Axis from "../components/axis/Axis.vue";
import Label from "../components/label/Label.vue";
import AnnotationModal from "../components/annotation/AnnotationModal.vue";
import LabelModal from "../components/label/LabelModal.vue";
import AxesModal from "../components/axis/AxesModal.vue";
import FileSelect from "../components/FileSelect.vue";
import { liveQuery } from "dexie";
import { db } from "/db";
import { useObservable } from "@vueuse/rxjs";

export default {
    name: "LeftSidebar",
    components: {
        Axis,
        Label,
        AnnotationModal,
        LabelModal,
        FileSelect,
        AxesModal,
    },
    setup: function(){
        const currAnn = useObservable(liveQuery(() => db.lastSelected.where('id').equals(1).first()));
        const labels = useObservable(liveQuery(async () => {
            const curr = await db.lastSelected.where('id').equals(1).first();
            return db.labels.where('annoId').equals(parseInt(curr?.annoId || 1)).toArray();
        }));
        const annotationFiles = useObservable(liveQuery(() => db.annotations.toArray()));
        return {
            labels,
            annotationFiles,
            currAnn,
        }
    },
    data() {
        return {
            lastSelectedAnnotation: 1,
            toggleAnnotationModalVisibility: false,
            toggleLabelModalVisibility: false,
            toggleAxesModalVisibility: false,
            labelToEdit: null,
            axisToEdit: null,
            addLabelKey: 0,
            acceptedKeys: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
            axisModalTitle: "Add Axis",
        }
    },
    computed: {
        lastSelectedData: function() {
            return this.$store.state.selectedData;
        },
        data: function() {
            return this.$store.state.data;
        },
        axes: function() {
            return this.$store.getters.getAxes;
        },
        selectedAxes: function() {
            return this.$store.getters.selectedAxes;
        },
        areasVisible: {
            get() {
                return this.$store.state.areasVisible;
            },
            set() {
                this.$store.commit("toggleAreasVisibility");
            }
        },
    },
    watch: {
        currAnn: function(){
            this.lastSelectedAnnotation = this.currAnn?.annoId;
        },
    },
    methods: {
        labelOnClick(label) {
            this.$store.commit("toggleActiveLabel", label);
        },
        editLabel(label) {
            this.labelToEdit = label;
            this.toggleLabelModalVisibility = !this.toggleLabelModalVisibility;
        },
        editAxis(axis) {
            this.axisModalTitle = "Edit Axis";
            this.axisToEdit = axis;
            this.toggleAxesModalVisibility = !this.toggleAxesModalVisibility;
        },
        showAnnotationModal() {
            this.toggleAnnotationModalVisibility = !this.toggleAnnotationModalVisibility;
        },
        showLabelModal() {
            if (this.addLabelKey == 0) {
                this.addLabelKey = 1;
            } else {
                this.addLabelKey = 0;
            }
            this.labelToEdit = null;
            this.toggleLabelModalVisibility = !this.toggleLabelModalVisibility;
        },
        showAxesModal() {
            this.axisModalTitle = "Add Axis";
            this.axisToEdit = null;
            this.toggleAxesModalVisibility = !this.toggleAxesModalVisibility;
        },
        keyPressed: function(e) {
            let key = e.key;
            if (this.acceptedKeys.indexOf(key) > -1) {
                if (key == 0) { // modify key so that by pressing 1 its the first label, which has index 0, and by pressing 0 you reach label 10
                    key = 10;
                } else {
                    key -= 1;
                }
                if (this.labels == undefined || this.labels == null) {
                    return;
                }
                const keys = Object.keys(this.labels);
                if (keys.length > 0 && keys.length > key) {
                    key = keys[key];
                    this.$store.state.activeLabel = this.labels[key];
                }
            }
        }
    },
    mounted: async function() {
        window.addEventListener("keypress", this.keyPressed);
    },
    beforeUnmount: function() {
        window.removeEventListener('keypress', this.keyPressed);
    },
}
</script>

<style scoped>
#scroll-container-axes {
    padding: 0px;
    overflow-y: auto;
    scrollbar-width: none;
    max-height: 25vh;
}

#scroll-container-axes::-webkit-scrollbar {
    width: 0;
    height: 0;
}

.axis-annotation-container {
    margin-left: 12px;
    padding-right: 12px;
    padding-left: 0px;
}

.input-group {
    padding-right: 0;
}

.btn-circle {
    margin-left: 10px;
}

.btn-circle:hover { 
    opacity: 1;
}

#scroll-container-labels {
    padding: 0px;
    overflow-y: auto;
    scrollbar-width: none;
    max-height: 25vh;
}
#scroll-container-labels::-webkit-scrollbar { 
    width: 0;
    height: 0;
}

#area-p {
    margin-bottom: 0;
}

.area-visibility-container {
    height: fit-content;
    display: inline-flex;
}

@media (max-width: 1200px) {
    #area-p {
        font-size: 0.75rem;
    }
}

@media (min-width: 1201px) {
    #area-p {
        font-size: 1rem;
    }
}
</style>