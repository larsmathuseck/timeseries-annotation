import { db } from "/db";

export async function createNewAnnotationFile() {
    const annotations = await db.annotations.toArray();
    let counter = 0;
    annotations.forEach(annotation => {
        if (annotation.name.includes("ModelAnnotation")) {
            counter ++;
        }
    });
    let name = "ModelAnnotation";
    if (counter != 0) {
        name += "(" + counter + ")";
    }
    return await db.annotations.add({
        name: name,
        lastAdded: {},
    });
}

export async function createLabelsForAnnotation(annotationId, amountOfLabels, colors) {
    for (let i = 0; i < amountOfLabels; i++) {
        await db.labels.add({
            name: "label_" + i,
            color: colors[i % colors.length],
            annoId: annotationId,
        });
    }
}

export async function deleteAnnotationFile() {
    const anno = await db.lastSelected.where('id').equals(1).first();
    const annoId = anno.annoId;
    await db.annotations.delete(annoId);
    db.annoData.where("annoId").equals(annoId).delete();
    db.labels.where("annoId").equals(annoId).delete();
    db.areas.where("annoId").equals(annoId).delete();
    const annotations = await db.annotations.toArray();
    if (annotations.length != 0) {
        db.lastSelected.update(1, {annoId: parseInt(annotations[0].id)});
    }
}