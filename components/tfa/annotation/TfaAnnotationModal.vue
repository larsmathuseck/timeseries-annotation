<template>
    <DialogContent>
        <DialogHeader>
            <div class="flex gap-4 items-center">
                <DialogTitle>New annotation</DialogTitle>
            </div>
            <DialogDescription>
                Create a virtual file that you can download later.
            </DialogDescription>
        </DialogHeader>
        <div class="flex flex-col gap-2">
            <label for="inputFileName">File name</label>
            <Input id="inputFileName" v-model="fileName" type="text" required />
        </div>
        <DialogFooter>
            <DialogClose as-child>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" @click="onSubmit">Add Annotation</Button>
        </DialogFooter>
    </DialogContent>
</template>

<script setup lang="ts">
const emit = defineEmits<{
    close: []
}>()

const store = useTfaStore()

// data
const fileName = ref<string>()

// methods
const onSubmit = async (e: Event) => {
    e.preventDefault()

    const newFileName = `${fileName.value}.csv`
    const annotationId = await database.annotationFile.add({
        name: newFileName,
        hash: undefined,
        // lastAdded: null,
    })
    await database.annotationFileSelected.put({ id: 1, annotationId })

    store.labelActive = undefined
    emit('close')
}

// lifecycle
// watch(
//     () => props.isVisible,
//     () => {
//         if (props.isVisible) return

//         fileName.value = undefined
//         error.value = undefined
//     },
// )
</script>
