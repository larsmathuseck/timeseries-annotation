<template>
    <div class="col-auto axis-annotation-col my-auto" :style="{ background: label.color }">
        <label class="axis-annotation-label my-auto">
            {{ label.name }}
        </label>
    </div>
    <div class="col-auto ms-1 p-0 me-auto my-auto">
        <label class="label-active" v-show="activeLabel != null && label.id === activeLabel.id">
            Active
        </label>
    </div>
    <div class="col-auto m-0 p-0">
        <button>
            <i class="fa-solid fa-pen-to-square axis-annotation-icon" @click="editLabel"></i>
        </button>
        <button>
            <i class="fa-solid fa-xmark axis-annotation-icon" @click="deleteLabel" />
        </button>
    </div>
</template>

<script>
import { db } from "/db";

export default {
    name: "TfaLabel",
    props: {
        label: Object,
    },
    computed: {
        activeLabel: function() {
            return this.$store.state.activeLabel;
        }
    },
    methods: {
        deleteLabel(event) {
            event.stopPropagation();
            db.labels.delete(this.label.id);
            db.annoData.where('labelId').equals(this.label.id).delete();
            db.areas.where('labelId').equals(this.label.id).delete();
            if(this.activeLabel === this.label) {
                this.$store.commit("toggleActiveLabel", null);
            }
        },
        editLabel(event) {
            event.stopPropagation();
            this.$emit("editLabel", this.label);
        }
    },
    emits: ["editLabel"],
}
</script>

<style scoped>
.label-active {
    text-align: right;
    display: block;
    color: rgb(128, 128, 128, 0.5);
}

button {
    background-color: rgb(255, 255, 255, 0);
    border: 0px;
    padding: 0 3px 0 3px;
}

@media (max-width: 1200px) {
    .label-active {
        font-size: 0.625rem;
    }
}

@media (min-width: 1201px) {
    .label-active {
        font-size: 0.75rem;
    }
}
</style>