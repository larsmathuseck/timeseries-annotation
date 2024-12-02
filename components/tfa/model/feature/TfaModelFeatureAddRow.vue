<template>
    <div>
        <div />
        <label :for="labelFor">{{ label }}</label>
        <div>
            <slot />
        </div>
        <div />
    </div>
</template>

<script lang="ts" setup>
interface Props {
    label: string
    labelFor: string
}
defineProps<Props>()
</script>
