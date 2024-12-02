<template>
    <div>
        <span
            v-for="color in COLORS"
            :key="color"
            :style="{ backgroundColor: color }"
            :aria-label="'Pick color ' + color"
            role="button"
            tabindex="0"
            @click="emit('colorPicked', color)"
            @keydown.enter="emit('colorPicked', color)"
        />
    </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
    colorPicked: [color: string]
}>()
</script>
