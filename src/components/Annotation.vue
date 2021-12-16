<template>
    <div class="col-auto" :style="{ background: annotation.color }">
        <label class="annotation-name">
            {{ annotation.name }}
        <i @click="deleteAnnotation(annotation)" class="fa fa-times"></i>
        </label>
    </div>
    <label class="annotation-timestamp">
        {{ annotation.timestamp }}
    </label>
</template>

<script>
export default {
    name: "Annotation",
    props: {
        annotation: Object,
    },
    methods: {
        deleteAnnotation(annotation) {
            console.log("before commit: ", annotation)
            this.$store.commit("deleteAnnotation", annotation.annotationObject)
        }
    },
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

.annotation-name {
    font-family: Tahoma;
    font-size: 1vw;
    color: white;
    margin: 0px;
}

.annotation-timestamp {
    text-align: right;
    display: block;
    color: rgb(128, 128, 128, 0.5);
    margin-top: 0;
    margin-bottom: 1vw;
}

i {
    margin-left: 5px;
}

</style>