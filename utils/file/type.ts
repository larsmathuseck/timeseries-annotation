// const FILE_TYPE_BIN = 'application/octet-stream'
const FILE_TYPE_CSV = 'text/csv'
// const FILE_TYPE_JSON = 'application/json'

export const FILE_TYPES_SUPPORTED = [
    // FILE_TYPE_BIN,
    FILE_TYPE_CSV,
    // FILE_TYPE_JSON,
]

export const getFileTyped = async ({
    annotationColumnNames,
    file,
    content,
}: {
    annotationColumnNames: string[]
    file: File
    content: string
}) => {
    switch (file.type) {
        // case FILE_TYPE_BIN:
        //     return { content, type: 'model_weight' as const }
        case FILE_TYPE_CSV:
            return await getFileTypedCsv({ annotationColumnNames, content })
        // case FILE_TYPE_JSON:
        //     return getFileTypedJson({ content })
        default:
            notifyDebug({ message: `Unsupported file type "${file.type}"` })
    }
}

const getFileTypedCsv = async ({
    annotationColumnNames = ['label', 'labels', 'annotation', 'annotations'],
    content,
}: {
    annotationColumnNames?: string[]
    content: string
}) => {
    const csv = await getCsv(content)
    const headerRow = getHeaderRow(csv) || []

    for (const headerRowItem of headerRow) {
        if (annotationColumnNames.includes(headerRowItem.toLocaleLowerCase())) {
            return { content: csv, type: 'annotation' as const }
        }
    }

    return { content: csv, type: 'data' as const }
}

// const getFileTypedJson = ({ content }: { content: string }) => {
//     const json = JSON.parse(content)

//     // TODO: differentiate models from configurations

//     return { content: json, type: 'mode' as const }
// }
