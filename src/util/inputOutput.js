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