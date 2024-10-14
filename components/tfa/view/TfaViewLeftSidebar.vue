<template>
    <div>
        <div class="row">
            <label class="description-text">Data Files</label>
            <div class="input-group">
                <TfaFileSelect
                    v-if="store.dataSelector"
                    type="data"
                    :data="store.data"
                    :selected="store.dataSelector"
                />
            </div>
        </div>
        <div class="row">
            <span class="description-text">
                <label>Axes</label>
                <button
                    type="button"
                    class="btn btn-default btn-circle"
                    @click="showAxesModal"
                >
                    <i class="fa-solid fa-plus"></i>
                </button>
            </span>
            <div id="scroll-container-axes">
                <div
                    v-for="axis in store.axesSelected"
                    :key="axis.id"
                    class="row axis-annotation-container"
                >
                    <TfaAxis
                        :axis="axis"
                        :is-selected="
                            store.axesSelectedSelected.indexOf(axis.id) > -1
                        "
                        @editAxis="editAxis"
                    />
                </div>
            </div>
        </div>
        <div class="row">
            <label class="description-text">Annotation Files</label>
            <div class="input-group">
                <TfaFileSelect
                    v-if="annotationFiles"
                    type="annotation"
                    :data="annotationFiles"
                    :selected="lastSelectedAnnotation"
                    @showAnnotationModal="showAnnotationModal"
                />
            </div>
        </div>
        <div class="row">
            <span class="description-text">
                <label>Labels</label>
                <button
                    type="button"
                    class="btn btn-default btn-circle"
                    @click="showLabelModal"
                >
                    <i class="fa-solid fa-plus"></i>
                </button>
            </span>
            <div class="row justify-content-start align-items-center">
                <div class="col-auto area-visibility-container">
                    <p id="area-p">Areas visible</p>
                </div>
                <div class="col-auto area-visibility-container px-0">
                    <label class="switch">
                        <input
                            v-show="false"
                            v-model="areasVisible"
                            type="checkbox"
                        />
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
            <div id="scroll-container-labels">
                <div
                    v-for="label in labels"
                    :key="label.id"
                    class="row axis-annotation-container"
                    @click="labelOnClick(label)"
                >
                    <TfaLabel :label="label" @editLabel="editLabel" />
                </div>
            </div>
        </div>
        <TfaAnnotationModal
            :toggle-modal-visibility="toggleAnnotationModalVisibility"
        />
        <TfaLabelModal
            :add-label-key="addLabelKey"
            :toggle-modal-visibility="toggleLabelModalVisibility"
            :label-to-edit="labelToEdit"
        />
        <TfaAxisModal
            :toggle-modal-visibility="toggleAxesModalVisibility"
            :title="axisModalTitle"
            :axis-to-edit="axisToEdit"
            @reloadGraph="emit('reloadGraph')"
        />
    </div>
</template>

<script setup lang="ts">
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'
import { db } from '../../../db'

const KEYS_ACCEPTED = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

const emit = defineEmits<{
    reloadGraph: []
}>()

const store = useTfAnnotatorStore()

// async data
const currentAnnotation = useObservable(
    from(liveQuery(() => db.lastSelected.where('id').equals(1).first())),
)
const labels = useObservable(
    from(
        liveQuery(async () => {
            const current = await db.lastSelected.where('id').equals(1).first()
            return db.labels
                .where('annotationId')
                .equals(current?.annotationId || 1)
                .toArray()
        }),
    ),
)
const annotationFiles = useObservable(
    from(liveQuery(() => db.annotations.toArray())),
)

// data
const lastSelectedAnnotation = ref(1)
const toggleAnnotationModalVisibility = ref(false)
const toggleLabelModalVisibility = ref(false)
const toggleAxesModalVisibility = ref(false)
const labelToEdit = ref()
const axisToEdit = ref()
const addLabelKey = ref(0)
const axisModalTitle = ref('Add Axis')

// computed
// const lastSelectedData = computed(() => {
//     return store.dataSelector
// })
// const data = computed(() => {
//     return store.data
// })
// const axes = computed(() => {
//     return store.axesSelected
// })
// const selectedAxes = computed(() => {
//     return this.$store.getters.selectedAxes
// })
const areasVisible = computed({
    get() {
        return store.isAreasVisible
    },
    set() {
        store.toggleAreasVisibility()
    },
})

// methods
const labelOnClick = (label: { id: number }) => {
    store.labelActive = label
}
const editLabel = (label: { id: unknown }) => {
    labelToEdit.value = label
    toggleLabelModalVisibility.value = !toggleLabelModalVisibility.value
}
const editAxis = (axis: unknown) => {
    axisModalTitle.value = 'Edit Axis'
    axisToEdit.value = axis
    toggleAxesModalVisibility.value = !toggleAxesModalVisibility.value
}
const showAnnotationModal = () => {
    toggleAnnotationModalVisibility.value =
        !toggleAnnotationModalVisibility.value
}
const showLabelModal = () => {
    if (addLabelKey.value === 0) {
        addLabelKey.value = 1
    } else {
        addLabelKey.value = 0
    }
    labelToEdit.value = undefined
    toggleLabelModalVisibility.value = !toggleLabelModalVisibility.value
}
const showAxesModal = () => {
    axisModalTitle.value = 'Add Axis'
    axisToEdit.value = undefined
    toggleAxesModalVisibility.value = !toggleAxesModalVisibility.value
}
const keyPressed = (e: KeyboardEvent) => {
    let key = e.key
    if (KEYS_ACCEPTED.includes(key)) {
        if (key === '0') {
            // modify key so that by pressing 1 its the first label, which has index 0, and by pressing 0 you reach label 10
            key = '10'
        } else {
            key = `${+key - 1}`
        }

        if (!labels.value) return

        const keys = Object.keys(labels.value)

        if (keys.length && keys.length > +key) {
            const _key = keys[+key]
            store.labelActive = labels.value[+_key]
        }
    }
}

// lifecycle
onMounted(() => {
    window.addEventListener('keypress', keyPressed)
})
onBeforeUnmount(() => {
    window.removeEventListener('keypress', keyPressed)
})
watch(currentAnnotation, (value) => {
    if (!value) return
    lastSelectedAnnotation.value = value.annotationId
})
</script>

<style scoped>
#scroll-container-axes {
    padding: 0px;
    overflow-y: auto;
    scrollbar-width: none;
    max-height: 25vh;
}

#scroll-container-axes::-webkit-scrollbar {
    width: 0;
    height: 0;
}

.axis-annotation-container {
    margin-left: 12px;
    padding-right: 12px;
    padding-left: 0px;
}

.input-group {
    padding-right: 0;
}

.btn-circle {
    margin-left: 10px;
}

#scroll-container-labels {
    padding: 0px;
    overflow-y: auto;
    scrollbar-width: none;
    max-height: 25vh;
}
#scroll-container-labels::-webkit-scrollbar {
    width: 0;
    height: 0;
}

#area-p {
    margin-bottom: 0;
}

.area-visibility-container {
    height: fit-content;
    display: inline-flex;
}

@media (max-width: 1200px) {
    #area-p {
        font-size: 0.75rem;
    }
}

@media (min-width: 1201px) {
    #area-p {
        font-size: 1rem;
    }
}
</style>
