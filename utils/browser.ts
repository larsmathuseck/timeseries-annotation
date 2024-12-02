export const download = ({
    data,
    fileType,
    name,
}: {
    data: string
    fileType: BlobPropertyBag['type']
    // _fileTypeExtension: any
    name: string
}) => {
    const a = document.createElement('a')
    a.href = window.URL.createObjectURL(new Blob([data], { type: fileType }))
    a.download = name
    a.click()
}

export const isWebkitDirectorySupported = () =>
    document && 'webkitdirectory' in document.createElement('input')
