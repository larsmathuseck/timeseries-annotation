<template>
    <div>
        <div
            class="col-auto axis-annotation-col me-auto my-auto"
            :style="{ background: axis.color }"
        >
            <label class="axis-annotation-label">
                {{ axis.name }}
            </label>
        </div>
        <div class="col-auto m-0 p-0">
            <button class="m-0 py-0 pe-1">
                <i
                    class="fa-solid fa-pen-to-square axis-annotation-icon"
                    @click="editAxis"
                ></i>
            </button>
            <div class="col-auto my-auto">
                <label class="switch">
                    <input
                        v-show="false"
                        v-model="selected"
                        type="checkbox"
                        @change="toggleAxis"
                    />
                    <span class="slider round"></span>
                </label>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    axis: {
        color: string
        id: number
        name: string
    }
    isSelected: boolean
}
const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
    editAxis: [axis: {}]
}>()

const store = useTfAnnotatorStore()

// data
const selected = ref(props.isSelected)

// methods
const toggleAxis = () => {
    if (selected.value) {
        store.addSelectedAxis(props.axis)
    } else {
        if (Object.entries(store.axesSelected).length <= 1) {
            selected.value = true
            alert('At least 1 axis must be selected!')
            return
        }
        store.removeSelectedAxis(props.axis)
    }
}
const editAxis = (event: Event) => {
    event.stopPropagation()
    emit('editAxis', props.axis)
}

// lifecycle
watch(
    () => props.isSelected,
    (value) => {
        selected.value = value
    },
)
</script>

<style scoped>
.col-auto {
    display: inline-flex;
}
button {
    background-color: rgb(255, 255, 255, 0);
    border: 0;
}

i {
    margin-bottom: 0px;
}
</style>
