<template>
    <div class="row">
        <label class="description-text">
            Annotations
        </label>
        <label class="description-text-sm">
            List of Annotations
        </label>
        <div id="scroll-container" class="mh-50">
            <div class="annotation-container" v-for="annotation in annotations" :key="annotation.id">
                <Annotation :annotation="annotation" />
            </div>
        </div>
    </div>
</template>

<script>
import Annotation from "./Annotation.vue"

export default {
    name: "RightSightbar",
    components: {
        Annotation,
    },
    computed: {
        annotations: function() {
            return this.$store.getters.getAnnotations;
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