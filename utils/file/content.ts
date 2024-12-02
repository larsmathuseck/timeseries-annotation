const addFile = async ({
    annotationColumnNames,
    file,
    hashAlgorithm,
    store,
}: {
    file: File
    hashAlgorithm?: AlgorithmIdentifier
    store: ReturnType<typeof useTfaStore>
    annotationColumnNames: string[]
}) => {
    if (!isValid(file))
        return notifyDebug({ message: `Invalid file: ${file.name}` })

    const fileContent = await getContent(file)
    const fileHash = await getHash({
        algorithm: hashAlgorithm,
        string: fileContent,
    })
    const fileTyped = await getFileTyped({
        annotationColumnNames,
        content: fileContent,
        file,
    })

    if (!fileTyped)
        return notifyError({
            message: `Could not find file type for file "${file.name}"`,
        })

    const { content: fileContentParsed, type: fileType } = fileTyped

    switch (fileType) {
        case 'data':
            store.dataFileAdd({
                csv: fileContentParsed,
                fileName: file.name,
                fileHash,
            })
            break
        case 'annotation':
            addAnnotationData({
                csv: fileContentParsed,
                fileName: file.name,
                fileHash,
            })
            break
        default:
            notifyWarn({
                message: `Unexpected file type "${file.type}" for file "${file.name}"`,
            })
    }
}

export const addFiles = async ({
    annotationColumnNames,
    files,
    hashAlgorithm,
    store,
}: {
    annotationColumnNames: string[]
    files: FileList | File[] | null
    hashAlgorithm?: AlgorithmIdentifier
    store: ReturnType<typeof useTfaStore>
}) => {
    for (const file of files || []) {
        await addFile({ annotationColumnNames, file, hashAlgorithm, store })
    }
}

export const getContent = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
            const result = reader.result

            if (typeof result !== 'string') {
                notifyWarn({ message: `Invalid file content for ${file.name}` })
                reject(new Error(`Invalid file content for ${file.name}`))
                return
            }

            resolve(result)
        }
        reader.onerror = (error) => {
            notifyError({ message: `Error reading file ${file.name}:` }, error)
            reject(error)
        }
        reader.readAsText(file)
    })

const isValid = (file: File) => file.name !== '.'
