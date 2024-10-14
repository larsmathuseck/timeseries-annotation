<template>
    <div class="row absolute">
        <div class="col">
            <span
                v-for="color in store.colors"
                :key="color"
                class="dot"
                :style="{ background: color }"
                @click="colorPicked(color)"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    colorForAxis: boolean
}
const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
    axisColorPicked: [color: string]
    labelColorPicked: [color: string]
}>()

const store = useTfAnnotatorStore()

// methods
const colorPicked = (color: string) => {
    if (props.colorForAxis) {
        emit('axisColorPicked', color)
    } else {
        emit('labelColorPicked', color)
    }
}
</script>

<style scoped>
.dot {
    height: 35px;
    width: 35px;
    background-color: #bbb;
    border-radius: 50%;
    display: inline-block;
    margin: 3px;
    transition: all 0.2s ease-in-out;
}

.dot:hover {
    transform: scale(1.25);
}

.col {
    background-color: #f5f5f5;
    background-clip: content-box;
    z-index: 10;
}
</style>
