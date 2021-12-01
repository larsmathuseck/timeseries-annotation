<template>
    <div class="col-auto" :style="{ background: annotationLabel.color }">
        <label class="annotationLabel-name">
            {{ annotationNumber }}
            {{ annotationLabel.name }}
        <i @click="deleteAnnotationLabel(annotationLabel)" class="fa fa-times"></i>
        </label>
    </div>
    <label class="annotationLabel-timestamp">
        {{ annotationLabel.timestamp }}
    </label>
</template>

<script>
export default {
    name: "AnnotationLabel",
    props: {
        annotationLabel: Object,
        annotationNumber: Number,
    },
    methods: {
        deleteAnnotationLabel(annotationLabel) {
            this.$store.commit("deleteAnnotationLabel", annotationLabel)
        }
    },
    emits: ["delete-annotation-label"]
}
</script>

<style scoped>
.col-auto {
    border-radius: 10px;
    height: fit-content;
    width: fit-content;
    margin: 0px;
    margin-left: 0px;
    float:left;
    padding: 5px 10px 5px 10px;
}

.annotationLabel-name {
    font-family: Tahoma;
    font-size: 1rem;
    font-weight: bold;
    color: white;
    margin: 0px;
}

.annotationLabel-timestamp {
    text-align: right;
    display: block;
    color: rgb(128, 128, 128, 0.5);
    margin-top: 0;
    margin-bottom: 1rem;
}

i {
    margin-left: 5px;
}

.fa-times {
    opacity: 0.5;
}

.fa-times:hover {
    opacity: 1;
    cursor: pointer;
}
</style>