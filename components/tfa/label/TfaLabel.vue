<template>
    <div>
        <div
            class="col-auto axis-annotation-col my-auto"
            :style="{ background: label.color }"
        >
            <label class="axis-annotation-label my-auto">
                {{ label.name }}
            </label>
        </div>
        <div class="col-auto ms-1 p-0 me-auto my-auto">
            <label
                v-show="store.labelActive && label.id === store.labelActive.id"
                class="label-active"
            >
                Active
            </label>
        </div>
        <div class="col-auto m-0 p-0">
            <button>
                <i
                    class="fa-solid fa-pen-to-square axis-annotation-icon"
                    @click="editLabel"
                ></i>
            </button>
            <button>
                <i
                    class="fa-solid fa-xmark axis-annotation-icon"
                    @click="deleteLabel"
                />
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { IndexableType } from 'dexie'
import { db } from '../../../db'

interface Props {
    label: {
        color: string
        id: number
        name: string
    }
}
const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
    editLabel: [
        label: {
            id: IndexableType
        },
    ]
}>()

const store = useTfAnnotatorStore()

// // computations
// activeLabel() {
//     return store.labelActive
// }

// methods
const deleteLabel = (event: Event) => {
    event.stopPropagation()
    db.labels.delete(props.label.id)
    db.annoData.where('labelId').equals(props.label.id).delete()
    db.areas.where('labelId').equals(props.label.id).delete()

    if (store.labelActive === props.label) {
        store.labelActive = undefined
    }
}
const editLabel = (event: Event) => {
    event.stopPropagation()
    emit('editLabel', props.label)
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
