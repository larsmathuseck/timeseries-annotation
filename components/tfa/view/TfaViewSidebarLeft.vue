<template>
    <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-4">
                <span class="font-bold text-xl">Data Files</span>
                <TfaFileSelect
                    :files="store.dataFiles"
                    :file-id-selected="store.dataFileSelectedId"
                    type="data"
                />
            </div>
            <div>
                <div class="flex items-center gap-4">
                    <span class="font-bold text-lg">Axes</span>
                    <TfaAxisModal
                        :toggle-modal-visibility="toggleAxesModalVisibility"
                        :title="axisModalTitle"
                        :axis-to-edit="axisToEdit"
                        @reload-graph="emit('reloadGraph')"
                    />
                </div>
                <div>
                    <TfaAxis
                        v-for="axis in store.dataFileSelectedAxes"
                        :key="axis.id"
                        :axis="axis"
                        :is-selected="axis.isSelected"
                        @edit-axis="editAxis"
                    />
                </div>
            </div>
        </div>
        <Separator />
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-4">
                <span class="font-bold text-xl">Annotation Files</span>
                <div>
                    <TfaFileSelect
                        :files="annotationFiles"
                        :file-id-selected="lastSelectedAnnotation"
                        type="annotation"
                    />
                </div>
            </div>
            <div class="flex flex-col gap-4">
                <div class="flex items-center gap-2">
                    <span class="font-bold text-lg">Labels</span>
                    <TfaAnnotationLabelModal
                        :add-label-key="addLabelKey"
                        :toggle-modal-visibility="toggleLabelModalVisibility"
                        :label-to-edit="labelToEdit"
                    />
                </div>
                <div class="flex justify-between gap-2">
                    <div class="font-bold">Areas visible</div>
                    <div>
                        <Switch
                            :checked="store.isAreasVisible"
                            @update:checked="store.toggleAreasVisibility"
                        />
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <div
                        v-for="label in annotationLabels"
                        :key="label.id"
                        @click="labelOnClick(label)"
                    >
                        <TfaAnnotationLabel
                            :label="label"
                            @edit-label="editLabel"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

const KEYS_ACCEPTED = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

const emit = defineEmits<{
    reloadGraph: []
}>()

const store = useTfaStore()

// async data
const currentAnnotation = useObservable(
    from(
        liveQuery(() =>
            database.annotationFileSelected.where('id').equals(1).first(),
        ),
    ),
)
const annotationLabels = useObservable(
    from(
        liveQuery(async () => {
            const current = await database.annotationFileSelected
                .where('id')
                .equals(1)
                .first()
            return database.annotationLabel
                .where('annotationId')
                .equals(current?.annotationId || 1)
                .toArray()
        }),
    ),
)
const annotationFiles = useObservable(
    from(liveQuery(() => database.annotationFile.toArray())),
)

// data
const lastSelectedAnnotation = ref(0)
const toggleLabelModalVisibility = ref(false)
const toggleAxesModalVisibility = ref(false)
const labelToEdit = ref()
const axisToEdit = ref()
const addLabelKey = ref(0)
const axisModalTitle = ref('Add Axis')

// methods
const labelOnClick = (label: { id: number }) => {
    store.labelActive = store.labelActive === label ? undefined : label
}
const editLabel = (label: { id: unknown }) => {
    labelToEdit.value = label
    toggleLabelModalVisibility.value = !toggleLabelModalVisibility.value
}
const editAxis = (axis: unknown) => {
    axisModalTitle.value = 'Edit Axis'
    axisToEdit.value = axis
    toggleAxesModalVisibility.value = true
}
// const toggleModal = (type: string) => {
//     debugger
//     switch (type) {
//         case 'label':
//             addLabelKey.value = addLabelKey.value === 0 ? 1 : 0
//             labelToEdit.value = undefined
//             toggleLabelModalVisibility.value = !toggleLabelModalVisibility.value
//             break
//         case 'axes':
//             axisModalTitle.value = 'Add Axis'
//             axisToEdit.value = undefined
//             toggleAxesModalVisibility.value = !toggleAxesModalVisibility.value
//             break
//     }
// }
const onKeyPressed = (e: KeyboardEvent) => {
    const keyIndex = getKeyIndex(e.key)
    if (keyIndex === undefined) return

    const labels = annotationLabels.value || []
    if (keyIndex >= labels.length) return

    const selectedLabel = labels[keyIndex]
    store.labelActive =
        store.labelActive === selectedLabel ? undefined : selectedLabel
}
const getKeyIndex = (key: string): number | undefined => {
    // modify key so that by pressing 1 its the first label, which has index 0, and by pressing 0 you reach label 10
    if (!KEYS_ACCEPTED.includes(key)) return undefined
    return key === '0' ? 9 : +key - 1
}

// lifecycle
onMounted(() => {
    window.addEventListener('keypress', onKeyPressed)
})
onBeforeUnmount(() => {
    window.removeEventListener('keypress', onKeyPressed)
})
watch(currentAnnotation, (value) => {
    if (value) lastSelectedAnnotation.value = value.annotationId
})
</script>
