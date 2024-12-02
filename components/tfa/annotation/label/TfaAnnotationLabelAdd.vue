<template>
    <form class="flex flex-col gap-4">
        <FormField v-slot="{ componentField }" name="labelName">
            <FormItem>
                <FormLabel>Label Name</FormLabel>
                <FormControl>
                    <Input v-bind="componentField" required />
                </FormControl>
                <FormDescription />
                <FormMessage />
            </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="labelColor">
            <FormItem>
                <FormLabel>Label Color</FormLabel>
                <FormControl>
                    <div class="flex">
                        <Input v-bind="componentField" required />
                        <Button
                            size="icon"
                            type="button"
                            variant="outline"
                            @click="toggleColorPicker"
                        >
                            <IHeroiconsEyeDropper />
                        </Button>
                    </div>
                </FormControl>
                <FormDescription />
                <FormMessage />

                <TfaColorPicker
                    v-show="showColorPicker"
                    @color-picked="colorPicked"
                />
            </FormItem>
        </FormField>
        <div v-if="error" role="alert">
            {{ error }}
        </div>
        <DialogFooter>
            <DialogClose as-child>
                <Button
                    type="button"
                    variant="secondary"
                    @click="$emit('closeModal')"
                >
                    Close
                </Button>
            </DialogClose>
            <Button type="submit" @click="onSubmit">Save</Button>
        </DialogFooter>
    </form>
</template>

<script setup lang="ts">
interface Props {
    labelToEdit?: {
        color: string
        id: number
        name: string
    }
}
const props = withDefaults(defineProps<Props>(), {
    labelToEdit: undefined,
})

const emit = defineEmits<{
    closeModal: []
    labelCreated: [{ color: string; name: string }]
    labelEdited: [{ color: string; id: number; name: string }]
}>()

// data
const labelName = ref<string>()
const labelColor = ref<string>()
const showColorPicker = ref(false)
const error = ref<string>()

// methods
const toggleColorPicker = () => {
    showColorPicker.value = !showColorPicker.value
}
const colorPicked = (color: string) => {
    labelColor.value = color
}
const onSubmit = async (e: Event) => {
    e.preventDefault()

    if (!labelName.value || !labelColor.value) {
        error.value = 'Both label name and color are required.'
        return
    }

    if (!props.labelToEdit) {
        const lastSelected = await database.annotationFileSelected
            .where('id')
            .equals(1)
            .first()

        if (!lastSelected) {
            error.value = 'No selected item found.'
            return
        }

        const currentAnnotation = await database.annotationFile
            .where('id')
            .equals(lastSelected.annotationId)
            .first()

        if (!currentAnnotation) {
            error.value = "Can't add Label. First add Annotation file!"
            return
        }

        emit('labelCreated', { name: labelName.value, color: labelColor.value })
    } else {
        emit('labelEdited', {
            id: props.labelToEdit.id,
            name: labelName.value || props.labelToEdit.name,
            color: labelColor.value || props.labelToEdit.color,
        })
    }

    resetForm()
}
const resetForm = () => {
    labelName.value = undefined
    labelColor.value = undefined
    showColorPicker.value = false
    error.value = undefined
}

// lifecycle
watch(
    () => props.labelToEdit,
    (labelToEdit) => {
        labelName.value = labelToEdit?.name
        labelColor.value = labelToEdit?.color
    },
    { immediate: true },
)
</script>
