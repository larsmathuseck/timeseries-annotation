import { db } from "/db";
import { parse } from "@vanillaes/csv";

export async function createNewAnnotationFile(fileName) {
    const annotations = await db.annotations.toArray();
    let counter = 0;
    annotations.forEach(annotation => {
        if (annotation.name.slice(0, fileName.length).includes(fileName)) {
            counter ++;
        }
    });
    let name = fileName;
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

export async function selectAnnotationFile(annoId) {
    const lastSelected = await db.lastSelected.where("id").equals(1).first();
    if (!lastSelected) {
        await db.lastSelected.put({id: 1, annoId: parseInt(annoId)});
    } else {
        await db.lastSelected.update(1, {annoId: parseInt(annoId)});
    }
}

export async function addAnnotationData(result, name, colors) {
    let data = parse(result);
    let legende = data.shift();
    let lastAnn = {};

    let anno = await db.annotations.add({
        name: name,
        lastAdded: lastAnn,
    });

    // Get Timestamp and Label location
    let timestampLocation = -1;
    let labelLocation = -1;
    for(let i = 0; i < legende.length; i++){
        if(legende[i].toLowerCase() == "timestamp"){
            timestampLocation = i;
        }
        else if(legende[i].toLowerCase() == "label"){
            labelLocation = i;
        }
    }

    for(let i = 0; i < data.length; i++){
        let label = await db.labels.where('[annoId+name]').equals([anno, data[i][labelLocation]]).toArray();
        if(label.length === 0){
            label = await db.labels.add({
                name: data[i][labelLocation],
                color: colors[i % colors.length],
                annoId: anno,
            });
        }
        else{
            label = label[0].id;
        }
        const newAnn = await db.annoData.add({
            labelId: label,
            annoId: anno,
            timestamp: new Date(data[i][timestampLocation]).getTime(),
        });
        lastAnn = newAnn;
    }
    await db.lastSelected.put({id: 1, annoId: anno});
    anno = await db.annotations.update(anno, {lastAdded: lastAnn});
}