<template>
    <div>
        {{ fileName?.length ? fileName : defaultText }}
    </div>
</template>

<script setup lang="ts">
interface Props {
    defaultText: string
    fileName?: string
}
withDefaults(defineProps<Props>(), {
    fileName: undefined,
})
</script>
