<template>
    <div class="col-auto axis-annotation-col me-auto my-0" :style="{ background: annotation.color }">
        <label class="axis-annotation-label">
            {{ index }}
            {{ annotation.name }}
            <i @click="deleteAnnotation(annotation)" class="fa-solid fa-xmark"></i>
        </label>
    </div>
    <div class="col-auto m-0 p-0">
        <label id="annotation-timestamp" class="my-auto">
            {{ annotation.timestamp }}
        </label>
    </div>
</template>

<script>
import { db } from "/db";

export default {
    name: "TfaAnnotation",
    props: {
        annotation: Object,
        index: Number,
    },
    methods: {
        deleteAnnotation(annotation) {
            db.annoData.delete(annotation.id);
        }
    },
}
</script>

<style scoped>
@media (max-width: 1200px) {
    #annotation-timestamp {
        font-size: 0.75rem;
    }
}

@media (min-width: 1201px) {
    #annotation-timestamp {
        font-size: 1rem;
    }
}
#annotation-timestamp {
    text-align: right;
    display: block;
    color: rgb(128, 128, 128, 0.5);
    margin: 0;
}

i {
    margin-left: 1px;
    opacity: 0.5;
}

i:hover {
    opacity: 1;
    cursor: pointer;
}
</style>