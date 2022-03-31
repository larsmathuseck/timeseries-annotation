<template>
    <!-- <div class="col-auto me-auto" :style="{ background: annotation.color }">
        <label class="annotation-name">
            {{ index }}
            {{ annotation.name }}
            <i @click="deleteAnnotation(annotation)" class="fa-solid fa-xmark"></i>
        </label>
    </div>
    <col-auto>
        <label class="annotation-timestamp">
            {{ annotation.timestamp }}
        </label>
    </col-auto> -->
    <div class="col-auto me-auto my-0" :style="{ background: annotation.color }">
        <label class="my-0">
            {{ index }}
            {{ annotation.name }}
            <!-- <i @click="deleteAnnotation(annotation)" class="fa-solid fa-xmark"></i> -->
        </label>
    </div>
    <div class="col-auto">
        <label id="annotation-timestamp">
            {{ annotation.timestamp }}
        </label>
    </div>
</template>

<script>
import { db } from "/db";

export default {
    name: "Annotation",
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
.col-auto {
    border-radius: 10px;
    margin: 0px;
    padding: 0px;
    display: inline-flex;
}

label {
    font-size: 0.8rem;
    color: white;
    padding: 4px;
    margin: 0px;
}

#annotation-timestamp {
    text-align: right;
    display: block;
    color: rgb(128, 128, 128, 0.5);
    margin: 0;
    margin-bottom: 0.25rem;   
}

i {
    margin-left: 1px;
}

</style>