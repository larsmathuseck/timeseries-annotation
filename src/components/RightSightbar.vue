<template>
    <div class="row">
        <p class="description-text">
            Annotations
        </p>
        <p class="description-text-sm">
            List of Annotations
        </p>
        <div id="scroll-container" class="mh-50">
            <div class="annotation-container" v-for="annotationLabel in annotationLabels" :key="annotationLabel.id">
                <AnnotationLabel :annotationLabel="annotationLabel" />
            </div>
        </div>
    </div>
</template>

<script>
import { DateTime } from "luxon"
import AnnotationLabel from "./AnnotationLabel.vue"

export default {
    name: "RightSightbar",
    components: {
        AnnotationLabel,
    },
    computed: {
        annotationLabels: function() {
            let ann = this.$store.getters.getAnnotations;
            for(let i = 0; i < ann.length; i++){
                ann[i].timestamp = DateTime.fromMillis(ann[i].timestamp).toFormat('hh:mm:ss SSS');
            }
            return ann;
        }
    },
}
</script>

<style scoped>

#scroll-container {
    overflow-y: auto;
    max-height: 75vh;;
}

.annotation-container {
    padding: 12px 12px 12px 0px;
    border-bottom: 1.5px solid rgb(128, 128, 128, 0.5);
    
}

.annotation-container:hover {
    background-color: rgb(128, 128, 128, 0.1);
}

</style>