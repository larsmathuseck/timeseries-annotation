<template>
    <NumberField
        :default-value="placeholder"
        :disabled="disabled"
        :format-options="{
            ...(unit
                ? {
                      style: 'unit',
                      unit,
                  }
                : {}),
        }"
        :min="1"
    >
        <Label>{{ label }}</Label>
        <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
        </NumberFieldContent>
    </NumberField>
</template>

<script setup lang="ts">
interface Props {
    disabled?: boolean
    // id: string
    label: string
    placeholder?: number
    unit?: string
    // value?: number
}
withDefaults(defineProps<Props>(), {
    disabled: false,
    placeholder: undefined,
    unit: undefined,
    // value: undefined,
})

// const emit = defineEmits<{
//     input: [input: number]
// }>()
</script>
