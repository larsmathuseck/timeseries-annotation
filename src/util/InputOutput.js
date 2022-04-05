import { addAnnotationData } from "../util/DatabankManager";
import { db } from "/db";
import store from "../store";

export async function download(data, type1, type2, name) {
    if (typeof showSaveFilePicker === 'undefined') {
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(new Blob([data], {type: type1}));
        a.download = name;
        a.click();
    }
    else {
        try {
            const fileHandle = await self.showSaveFilePicker({
                suggestedName: name,
                types: [{
                    description: type1,
                    accept: type2,
                }],
            });
            const fileStream = await fileHandle.createWritable();
            await fileStream.write(new Blob([data], {type: type1}));
            await fileStream.close();
        } catch(error) {
            console.log(error);
        }
    }
}

function readFile(file) {
    const reader = new FileReader();
    if(file.name[0] != '.' && (file.type.toLowerCase().includes("text") || file.type.toLowerCase().includes("excel"))) {
        reader.readAsText(file);
        reader.onload = () => {
            if(file.name.toLowerCase().includes("data")) {
                store.commit("addData", {result: reader.result, name: file.name});
            }
        };
    }
}

export function readDataFiles(fileList) {
    for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
        const file = fileList[i];
        readFile(file);
    }
}

export function loadFolder(fileList) {
    let filesToUpload = [];
    let fileNames = {};
    for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
        const file = fileList[i];
        if(file.name[0] != '.' && (file.type.toLowerCase().includes("text") || file.type.toLowerCase().includes("excel"))) {
            filesToUpload.push(file);
            if (fileNames[file.name] == undefined) {
                fileNames[file.name] = 1;
            } else {
                fileNames[file.name] += 1;
            }
        }
    }
    if (filesToUpload.length > 1) {
        db.annotations.clear();
        db.annoData.clear();
        db.labels.clear();
        db.areas.clear();
    }
    for (let i in filesToUpload) {
        const file = filesToUpload[i];
        let fileName = file.name;
        if (fileNames[file.name] > 1) {
            const path = file.webkitRelativePath;
            const directories = path.split("/");
            fileName = directories.slice(-2)[0] + "/" + directories.slice(-1);
        }
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => {
            if(file.name.toLowerCase().includes("data")) {
                store.commit("addData", {result: reader.result, name: fileName});
            }
            else if(file.name.toLowerCase().includes("annotation") || file.name.toLowerCase().includes("labels")) {
                addAnnotationData(reader.result, file.name);
            }
        };
    }
}