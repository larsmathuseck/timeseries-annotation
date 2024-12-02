<template>
    <div>
        <div></div>
        <span for="samplingRateInput">
            {{ label }}
        </span>
        <div>
            <slot />
        </div>
        <span>
            {{ unit }}
        </span>
        <div />
    </div>
</template>

<script setup lang="ts">
interface Props {
    label: string
    unit?: string
}
withDefaults(defineProps<Props>(), {
    unit: undefined,
})
</script>
