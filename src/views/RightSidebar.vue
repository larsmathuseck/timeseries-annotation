<template>
    <div class="row">
        <label class="description-text">
            Annotations
        </label>
        <div id="scroll-container-annotations">
            <div class="row axis-annotation-container ps-0" v-for="(annotation, index) in annotations" :key="annotation.id">
                <Annotation :annotation="annotation" :index="index+1"/>
            </div>
        </div>
    </div>
</template>

<script>
import Annotation from "../components/annotation/Annotation.vue";
import { DateTime } from "luxon";
import { liveQuery } from "dexie";
import { db } from "/db";
import { useObservable } from "@vueuse/rxjs";

export default {
    name: "RightSidebar",
    components: {
        Annotation,
    },
    setup() {
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
            if(annoData != undefined) {
                for(let i = 0; i < annoData.length; i++) {
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
</style>