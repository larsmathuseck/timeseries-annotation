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