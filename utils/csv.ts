export const getCsv = async (string: string) => {
    const CsvWorker = (await import('./webworker/csv.ts?worker')).default

    const worker = new CsvWorker()

    return new Promise<string[][]>((resolve, reject) => {
        worker.postMessage(string)
        worker.onmessage = function (event) {
            resolve(event.data)
        }
        worker.onerror = function (error) {
            reject(error)
        }
    })
}

export const getHeaderRow = (csv: string[][]) => {
    const headerRow = csv[0]

    if (!headerRow) return notifyError({ message: 'No header row found' })

    return headerRow
}
