import {
    useDropZone,
    useFileDialog,
    type UseDropZoneOptions,
} from '@vueuse/core'

export const useTfaFileDialog = ({
    onChange,
}: {
    onChange: (files: FileList | null) => void
}) => {
    const {
        open: fileDialogOpen,
        onChange: fileDialogOnChange,
        // files: fileDialogFiles,
        // reset,
        // onCancel,
    } = useFileDialog({
        accept: FILE_TYPES_SUPPORTED.join(),
    })

    fileDialogOnChange((files) => onChange(files))

    return {
        fileDialogOpen,
    }
}

export const useTfaFolderDialog = ({
    onChange,
}: {
    onChange: (files: FileList | null) => void
}) => {
    const {
        open: folderDialogOpen,
        onChange: folderDialogOnChange,
        // files: fileDialogFiles,
        // reset,
        // onCancel,
    } = useFileDialog({
        accept: FILE_TYPES_SUPPORTED.join(),
        directory: true,
    })
    folderDialogOnChange((files) => onChange(files))
    const tryFolderDialogOpen = () => {
        if (!isWebkitDirectorySupported()) {
            return notifyError({
                message: `Your browser does not support folder input`,
            })
        }

        folderDialogOpen()
    }

    return {
        tryFolderDialogOpen,
    }
}

export const useTfaDropZone = ({
    onDrop,
    ref,
}: {
    onDrop: UseDropZoneOptions['onDrop']
    ref: Ref
}) =>
    useDropZone(ref, {
        onDrop,
        dataTypes: FILE_TYPES_SUPPORTED,
        multiple: true,
    })
