import { parse } from '@vanillaes/csv'

self.onmessage = (event) => {
    const csv = parse(event.data) as string[][]
    self.postMessage(csv)
}
