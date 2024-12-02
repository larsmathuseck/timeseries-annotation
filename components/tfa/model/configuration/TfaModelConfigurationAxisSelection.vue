<template>
    <div class="flex flex-col">
        <FormLabel>Axis Selection</FormLabel>
        <div v-for="axis in axes" :key="axis.id">
            <Checkbox
                :checked="!!selectedAxes.length"
                :disabled="disabled"
                @update:checked="emit('input', axis.name)"
            />
            <!-- <Input
                type="checkbox"
                :value="{ id: axis.id, name: axis.name }"
                :disabled="disabled"
            /> -->
            {{ axis.name }}
        </div>
        <p v-for="axis in selectedAxes" :key="axis.id">
            {{ selectedAxes.indexOf(axis) + 1 }}. {{ axis.name }}
        </p>
        <Button
            type="button"
            variant="destructive"
            @click="emit('clearSelection')"
        >
            Clear Axis Selection
        </Button>
    </div>
</template>

<script setup lang="ts">
import type { Axis } from '~/stores/tfAnnotator'

interface Props {
    axes?: Record<number, Axis>
    selectedAxes: Axis[]
    disabled?: boolean
}
withDefaults(defineProps<Props>(), {
    axes: () => ({
        1: { id: 1, name: '123', color: 'red', dataPoints: [[0]] },
    }),
    disabled: false,
})

const emit = defineEmits<{
    clearSelection: []
    input: [selectedAxesinput: string]
}>()
</script>
