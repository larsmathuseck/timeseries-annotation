<template>
    <div>
        <input
            type="file"
            :webkitdirectory="directory"
            :directory="directory"
            hidden
            @change="emit('change', $event)"
        />
        <Button type="button" @click="emit('click')">
            <!-- <i class="fa-solid" :class="iconClass" /> -->
            {{ label }}
        </Button>
    </div>
</template>

<script setup lang="ts">
interface Props {
    directory?: boolean
    disabled?: boolean
    label: string
    iconClass: string
}
withDefaults(defineProps<Props>(), {
    directory: undefined,
    disabled: undefined,
})

const emit = defineEmits<{
    change: [e: Event]
    click: []
}>()
</script>
