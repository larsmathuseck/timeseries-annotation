<template>
    <div class="flex justify-between p-4">
        <Menubar>
            <MenubarMenu>
                <!-- for multiple dialogs in this menu see: https://github.com/shadcn-ui/ui/issues/1011#issuecomment-1930103090 -->
                <Dialog v-model:open="isDialogOpen">
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem @click="fileDialogOpen">
                            Import file
                        </MenubarItem>
                        <MenubarItem @click="tryFolderDialogOpen">
                            Import folder
                        </MenubarItem>
                        <MenubarSeparator />
                        <DialogTrigger as-child>
                            <MenubarItem>New annotation file</MenubarItem>
                        </DialogTrigger>
                        <MenubarItem @click="saveAnnotation">
                            Download annotation file
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem @click="navigateTo('/setup')">
                            Quit
                        </MenubarItem>
                    </MenubarContent>
                    <TfaAnnotationModal @close="(isDialogOpen = false)" />
                </Dialog>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                    <MenubarRadioGroup v-model="colorMode.preference">
                        <MenubarRadioItem value="system">
                            System colors
                        </MenubarRadioItem>
                        <MenubarRadioItem value="light">
                            Light colors
                        </MenubarRadioItem>
                        <MenubarRadioItem value="dark">
                            Dark colors
                        </MenubarRadioItem>
                    </MenubarRadioGroup>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Help</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem @click="clearDatabase">
                        Clear local database
                    </MenubarItem>
                    <template v-if="isDev">
                        <!-- TODO: below is only an example for server-side storage, evaluate usage for data & annotation storage -->
                        <MenubarSeparator />
                        <MenubarItem @click="listServerUsers">
                            Show users
                        </MenubarItem>
                        <MenubarItem @click="createServerUser">
                            Create new user
                        </MenubarItem>
                        <MenubarItem @click="deleteServerUsers">
                            Delete all users
                        </MenubarItem>
                    </template>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
        <!-- <div class="flex gap-4">
            <TfaModelImportModal
                :toggle-model-modal-visibility="isModelModalVisible"
            />
        </div> -->
    </div>
</template>

<script setup lang="ts">
import { stringify } from '@vanillaes/csv'
import { DateTime } from 'luxon'

interface Props {
    title: string
}
withDefaults(defineProps<Props>(), {})

const colorMode = useColorMode()
const store = useTfaStore()
const runtimeConfig = useRuntimeConfig()

// data
const annotationColumnNames =
    runtimeConfig.public.tfa.annotationColumnNames.split(',')
const hashAlgorithm = runtimeConfig.public.tfa.hashAlgorithm
const isDialogOpen = ref<boolean>(false)
const isDev = import.meta.dev

// methods
const { fileDialogOpen } = useTfaFileDialog({
    onChange: (files) =>
        addFiles({ annotationColumnNames, files, hashAlgorithm, store }),
})
const { tryFolderDialogOpen } = useTfaFolderDialog({
    onChange: (files) => addFiles({ annotationColumnNames, files, store }),
})
// const annotationNew = () => (isDialogOpen.value = true)
const saveAnnotation = async () => {
    const currentAnnotation = await database.annotationFileSelected
        .where('id')
        .equals(1)
        .first()

    if (currentAnnotation) {
        const content = await loadAnnotations(currentAnnotation)
        const annotationFile = await database.annotationFile
            .where('id')
            .equals(currentAnnotation.annotationId)
            .first()

        if (content && content.length > 1 && annotationFile?.name) {
            // const type = { 'text/csv': ['.csv'] }
            download({
                data: content,
                fileType: 'text/csv',
                //type,
                name: annotationFile.name,
            })
        }
    }
}
const loadAnnotations = async (currentAnnotation: { annotationId: number }) => {
    const annotations = await database.annotationTimestamp
        .where('annotationId')
        .equals(currentAnnotation.annotationId)
        .sortBy('timestamp')

    const annotatedData = []

    for (const annotation of annotations) {
        const label = await database.annotationLabel.get(annotation.labelId)
        annotatedData.push({
            ...annotation,
            label,
        })
    }

    const data = [['Timestamp', 'Label']]

    for (const annotation of annotatedData) {
        if (annotation.label) {
            data.push([
                DateTime.fromMillis(annotation.timestamp).toFormat(
                    'yyyy-MM-dd HH:mm:ss.SSS',
                ),
                annotation.label.name,
            ])
        }
    }

    return stringify(data)
}
const deleteServerUsers = async () => {
    const user = await $fetch('/api/user', { method: 'DELETE' })
    notifyInfo({
        message: `Users: ${user.rows?.map((user) => `${user.firstName} ${user.lastName} (${user.id})`).join(', ') || 'none'}`,
    })
}
const listServerUsers = async () => {
    const user = await $fetch('/api/user')
    notifyInfo({
        message: `Users: ${user.rows?.map((user) => `${user.firstName} ${user.lastName} (${user.id})`).join(', ') || 'none'}`,
    })
}
const createServerUser = async () => {
    const user = await $fetch('/api/user', { method: 'POST' })
    notifyInfo({
        message: `New user: ${user.rows?.map((user) => `${user.firstName} ${user.lastName} (${user.id})`)[0]}`,
    })
}
</script>
