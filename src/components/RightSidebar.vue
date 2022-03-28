<template>
    <div class="row">
        <label class="description-text">
            Annotations
        </label>
        <div id="scroll-container-annotations">
            <div class="d-flex justify-content-between annotation-container" v-for="annotation in annotations" :key="annotation.id">
                <Annotation :annotation="annotation" />
            </div>
        </div>
    </div>
</template>

<script>
import Annotation from "./Annotation.vue"
import { DateTime } from "luxon"
import { liveQuery } from "dexie";
import { db } from "/db";
import { useObservable } from "@vueuse/rxjs";

export default {
    name: "RightSidebar",
    components: {
        Annotation,
    },
    setup: function(){
        const annoData = useObservable(liveQuery(async () => {
            const curr = await db.lastSelected.where('id').equals(1).first();
            const annotations = await db.annoData.where('annoId').equals(parseInt(curr?.annoId || 1)).sortBy('timestamp');
            await Promise.all (annotations.map (async anno => {
                [anno.label] = await Promise.all([
                    db.labels.get(anno.labelId)
                ]);
            }));
            return annotations;
        }));
        return {
            annoData,
        }
    },
    computed: {
        annotations: function() {
            let annoData = this.annoData;
            if(annoData != undefined){
                for(let i = 0; i < annoData.length; i++){
                    const label = annoData[i].label;
                    annoData[i].name = label.name;
                    annoData[i].color = label.color;
                    annoData[i].timestamp = DateTime.fromMillis(annoData[i].timestamp).toFormat('hh:mm:ss SSS');
                }
            }
            
            return annoData;
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
    padding: 0.3vw 0.3vw 0.3vw 0vw;
    border-bottom: 0.1vw solid rgb(128, 128, 128, 0.5);
}

.annotation-container:hover {
    background-color: rgb(128, 128, 128, 0.1);
}

</style>