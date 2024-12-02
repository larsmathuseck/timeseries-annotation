import { database } from './database'

export const annotationFileCreate = async (fileName: string) => {
    const annotations = await database.annotationFile.toArray()
    const counter = annotations.filter(({ name }) =>
        name.startsWith(fileName),
    ).length

    const name = counter ? `${fileName}(${counter})` : fileName

    return database.annotationFile.add({
        name,
        hash: undefined,
    })
}

export const annotationLabelsAdd = async (
    annotationId: number,
    amountOfLabels: number,
) => {
    for (let i = 0; i < amountOfLabels; i++) {
        await database.annotationLabel.add({
            name: `label_${i}`,
            color: COLORS[i % COLORS.length],
            annotationId,
            annotationIdName: null,
        })
    }
}

export const annotationFileDelete = async () => {
    const annotationFileSelected = await database.annotationFileSelected
        .where('id')
        .equals(1)
        .first()
    if (!annotationFileSelected) return

    const annotationId = annotationFileSelected.annotationId

    await Promise.all([
        database.annotationArea
            .where('annotationId')
            .equals(annotationId)
            .delete(),
        database.annotationFile.delete(annotationId),
        database.annotationLabel
            .where('annotationId')
            .equals(annotationId)
            .delete(),
        database.annotationTimestamp
            .where('annotationId')
            .equals(annotationId)
            .delete(),
    ])

    const annotationFiles = await database.annotationFile.toArray()

    if (annotationFiles.length) {
        database.annotationFileSelected.update(1, {
            annotationId: annotationFiles[0].id,
        })
    } else {
        database.annotationFileSelected
            .where('annotationId')
            .equals(annotationId)
            .delete()
    }
}

export const selectAnnotationFile = async (annotationId: number) => {
    const lastSelected = await database.annotationFileSelected
        .where('id')
        .equals(1)
        .first()

    if (lastSelected) {
        await database.annotationFileSelected.update(1, { annotationId })
    } else {
        await database.annotationFileSelected.put({ id: 1, annotationId })
    }
}

export const addAnnotationData = async ({
    csv,
    fileHash,
    fileName,
}: {
    csv: string[][]
    fileHash: string
    fileName: string
}) => {
    const headerRow = getHeaderRow(csv) || []

    const annotation = await database.annotationFile.add({
        name: fileName,
        hash: fileHash,
        // lastAdded: annotationLast,
    })

    const timestampLocation = headerRow.findIndex(
        (col: string) => col.toLowerCase() === 'timestamp',
    )
    const labelLocation = headerRow.findIndex(
        (col: string) => col.toLowerCase() === 'label',
    )

    for (const [index, row] of csv.entries()) {
        if (!index) continue

        const [label] = await database.annotationLabel
            .where('[annotationId+name]')
            .equals([annotation, row[labelLocation]])
            .toArray()

        const labelId = label
            ? label.id
            : await database.annotationLabel.add({
                  name: row[labelLocation],
                  color: COLORS[(csv.indexOf(row) - 1) % COLORS.length],
                  annotationId: annotation,
                  annotationIdName: null,
              })

        await database.annotationTimestamp.add({
            labelId,
            annotationId: annotation,
            timestamp: new Date(row[timestampLocation]).getTime(),
        })
    }

    await database.annotationFileSelected.put({
        id: 1,
        annotationId: annotation,
    })
}
