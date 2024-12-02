<template>
    <div>
        <div>
            <div>
                <input
                    ref="fileInputRef"
                    type="file"
                    :webkitdirectory="directory"
                    :directory="directory"
                    hidden
                    @change="onFileChange"
                />
                <Button
                    type="button"
                    :class="{ disabled: disabled }"
                    @click="buttonClick"
                >
                    <IHeroiconsFolder />
                    <span>{{ label }}</span>
                </Button>
            </div>
        </div>
        <div>
            {{ fileName ? fileName : placeholder }}
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    buttonClick?: () => void
    directory?: boolean
    disabled?: boolean
    fileName?: string
    label: string
    onFileChange?: (e: Event) => void
    placeholder?: string
}
withDefaults(defineProps<Props>(), {
    buttonClick: undefined,
    directory: false,
    disabled: false,
    fileName: undefined,
    onFileChange: undefined,
    placeholder: undefined,
})

// refs
const fileInputRef = ref<HTMLInputElement>()

// methods
const click = () => {
    if (fileInputRef.value) {
        fileInputRef.value.click()
    }
}

defineExpose({ click })
</script>
