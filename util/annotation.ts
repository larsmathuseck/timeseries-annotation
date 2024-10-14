import { parse } from '@vanillaes/csv'

import { db } from '../db'

export async function createNewAnnotationFile(fileName: string) {
    const annotations = await db.annotations.toArray()
    let counter = 0
    annotations.forEach((annotation) => {
        if (annotation.name.slice(0, fileName.length).includes(fileName)) {
            counter++
        }
    })
    let name = fileName
    if (counter !== 0) {
        name += '(' + counter + ')'
    }
    return await db.annotations.add({
        name,
        lastAdded: null,
    })
}

export async function createLabelsForAnnotation(
    annotationId: number,
    amountOfLabels: number,
    colors: string[],
) {
    for (let i = 0; i < amountOfLabels; i++) {
        await db.labels.add({
            name: 'label_' + i,
            color: colors[i % colors.length],
            annotationId,
            annotationIdName: null,
        })
    }
}

export async function deleteAnnotationFile() {
    const anno = await db.lastSelected.where('id').equals(1).first()

    if (!anno) return

    const annotationId = anno.annotationId
    await db.annotations.delete(annotationId)
    db.annoData.where('annotationId').equals(annotationId).delete()
    db.labels.where('annotationId').equals(annotationId).delete()
    db.areas.where('annotationId').equals(annotationId).delete()
    const annotations = await db.annotations.toArray()
    if (annotations.length !== 0) {
        db.lastSelected.update(1, {
            annotationId: annotations[0].id,
        })
    }
}

export async function selectAnnotationFile(annotationId: number) {
    const lastSelected = await db.lastSelected.where('id').equals(1).first()
    if (!lastSelected) {
        await db.lastSelected.put({ id: 1, annotationId })
    } else {
        await db.lastSelected.update(1, { annotationId })
    }
}

export async function addAnnotationData(
    result: string,
    name: string,
    colors: string[],
) {
    const data = parse(result)
    const legend = data.shift()
    let annotationLast: number | null = null

    let annotation = await db.annotations.add({
        name,
        lastAdded: annotationLast,
    })

    // Get Timestamp and Label location
    let timestampLocation = -1
    let labelLocation = -1
    for (let i = 0; i < legend.length; i++) {
        if (legend[i].toLowerCase() === 'timestamp') {
            timestampLocation = i
        } else if (legend[i].toLowerCase() === 'label') {
            labelLocation = i
        }
    }

    for (let i = 0; i < data.length; i++) {
        const label = await db.labels
            .where('[annotationId+name]')
            .equals([annotation, data[i][labelLocation]])
            .toArray()
        if (label.length === 0) {
            const _label = await db.labels.add({
                name: data[i][labelLocation],
                color: colors[i % colors.length],
                annotationId: annotation,
                annotationIdName: null,
            })
            const annotationNew = await db.annoData.add({
                labelId: _label,
                annotationId: annotation,
                timestamp: new Date(data[i][timestampLocation]).getTime(),
            })
            annotationLast = annotationNew
        } else {
            const _label = label[0].id
            const annotationNew = await db.annoData.add({
                labelId: _label,
                annotationId: annotation,
                timestamp: new Date(data[i][timestampLocation]).getTime(),
            })
            annotationLast = annotationNew
        }
    }

    await db.lastSelected.put({ id: 1, annotationId: annotation })

    annotation = await db.annotations.update(annotation, {
        lastAdded: annotationLast,
    })
}
