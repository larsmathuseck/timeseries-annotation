<template>
    <div class="row h-100">
        <label class="description-text">
            Annotations
        </label>
        <label class="description-text-sm">
            List of Annotations
        </label>
        <div id="scroll-container-annotations">
            <div class="annotation-container" v-for="annotation in annotations" :key="annotation.id">
                <Annotation :annotation="annotation" />
            </div>
        </div>
    </div>
</template>

<script>
import Annotation from "./Annotation.vue"
import { DateTime } from "luxon"

export default {
    name: "RightSidebar",
    components: {
        Annotation,
    },
    computed: {
        annotations: function() {
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
#scroll-container-annotations {
    overflow-y: auto;
    max-height: 80vh;
}
#scroll-container-annotations::-webkit-scrollbar {
    width: 0px;
    height: 0px;
}

.annotation-container {
    padding: 12px 12px 12px 0px;
    border-bottom: 0.1vw solid rgb(128, 128, 128, 0.5);
    
}

.annotation-container:hover {
    background-color: rgb(128, 128, 128, 0.1);
}

</style>