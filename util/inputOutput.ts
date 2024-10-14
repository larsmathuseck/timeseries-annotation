import { db } from '../db'
import { addAnnotationData } from './annotation'
// import store from "../store";

export function download(
    data: string,
    fileType: BlobPropertyBag['type'],
    _fileTypeExtension: any,
    name: string,
) {
    // if (typeof showSaveFilePicker === 'undefined') {
    const a = document.createElement('a')
    a.href = window.URL.createObjectURL(new Blob([data], { type: fileType }))
    a.download = name
    a.click()
    // }
    // else {
    //     try {
    //         const fileHandle = await self.showSaveFilePicker({
    //             suggestedName: name,
    //             types: [{
    //                 description: fileType,
    //                 accept: _fileTypeExtension,
    //             }],
    //         });
    //         const fileStream = await fileHandle.createWritable();
    //         await fileStream.write(new Blob([data], { type: fileType }));
    //         await fileStream.close();
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
}

function readFile(file: File, store: ReturnType<typeof useTfAnnotatorStore>) {
    const reader = new FileReader()
    if (
        file.name[0] !== '.' &&
        (file.type.toLowerCase().includes('text') ||
            file.type.toLowerCase().includes('excel'))
    ) {
        reader.readAsText(file)
        reader.onload = () => {
            if (
                file.name.toLowerCase().includes('data') &&
                reader.result &&
                typeof reader.result === 'string'
            ) {
                store.addData({
                    result: reader.result,
                    name: file.name,
                })
            }
        }
    }
}

export function readDataFiles(
    fileList: FileList,
    store: ReturnType<typeof useTfAnnotatorStore>,
) {
    for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
        const file = fileList[i]
        readFile(file, store)
    }
}

export function loadFolder(
    fileList: FileList,
    store: ReturnType<typeof useTfAnnotatorStore>,
) {
    const filesToUpload: File[] = []
    const fileNames: Record<string, number> = {}

    for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
        const file = fileList[i]
        if (
            file.name[0] !== '.' &&
            (file.type.toLowerCase().includes('text') ||
                file.type.toLowerCase().includes('excel'))
        ) {
            filesToUpload.push(file)
            if (fileNames[file.name] === undefined) {
                fileNames[file.name] = 1
            } else {
                fileNames[file.name] += 1
            }
        }
    }

    if (filesToUpload.length > 1) {
        db.annotations.clear()
        db.annoData.clear()
        db.labels.clear()
        db.areas.clear()
    }

    for (const i in filesToUpload) {
        const file = filesToUpload[i]
        let fileName = file.name
        if (fileNames[file.name] > 1) {
            const path = file.webkitRelativePath
            const directories = path.split('/')
            fileName = directories.slice(-2)[0] + '/' + directories.slice(-1)
        }
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onload = () => {
            if (
                file.name.toLowerCase().includes('data') &&
                typeof reader.result === 'string'
            ) {
                store.addData({
                    result: reader.result,
                    name: fileName,
                })
            } else if (
                file.name.toLowerCase().includes('annotation') ||
                file.name.toLowerCase().includes('labels')
            ) {
                if (typeof reader.result !== 'string') return
                addAnnotationData(reader.result, file.name, store.colors)
            }
        }
    }
}
