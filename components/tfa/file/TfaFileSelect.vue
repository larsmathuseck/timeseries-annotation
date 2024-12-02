<template>
    <div class="flex gap-2 items-center">
        <Button size="icon" type="button" variant="ghost" @click="onDelete">
            <IHeroiconsTrash />
        </Button>
        <Select
            v-model="fileIdSelectedLocal"
            @update:model-value="onSelectChange"
        >
            <SelectTrigger>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem
                        v-for="file in files"
                        :key="file.id"
                        :value="file.id.toString()"
                    >
                        {{
                            `${file.name}${file.hash ? ` (${file.hash.substring(0, 6)})` : ''}`
                        }}
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    </div>
</template>

<script setup lang="ts">
interface Props {
    files?: Record<
        number,
        {
            hash?: string
            id: string | number
            name: string
        }
    >
    fileIdSelected?: string | number
    type: 'data' | 'annotation'
}
const props = withDefaults(defineProps<Props>(), {
    files: undefined,
    fileIdSelected: undefined,
})

const store = useTfaStore()

// data
const fileIdSelectedLocal = ref(props.fileIdSelected?.toString())

// methods
const onSelectChange = () => {
    switch (props.type) {
        case 'annotation':
            if (!fileIdSelectedLocal.value) return
            database.annotationFileSelected.update(1, {
                annotationId: parseInt(fileIdSelectedLocal.value),
            })
            break
        case 'data':
            if (!fileIdSelectedLocal.value) return
            store.dataFileSelectedId = fileIdSelectedLocal.value
            break
        default:
            notifyWarn({ message: `Unexpected type "${props.type}"` })
    }
}
const onDelete = async () => {
    switch (props.type) {
        case 'annotation':
            await annotationFileDelete()
            break
        case 'data':
            store.dataFileRemove()
            break
        default:
            notifyWarn({ message: `Unexpected type "${props.type}"` })
    }
}

// lifecycle
watch(
    () => props.fileIdSelected,
    (value) => (fileIdSelectedLocal.value = value?.toString()),
)
</script>
