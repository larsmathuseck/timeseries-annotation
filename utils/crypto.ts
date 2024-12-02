const TEXT_ENCODER = new TextEncoder()

export const getHash = async ({
    algorithm = 'SHA-1',
    string,
}: {
    algorithm?: AlgorithmIdentifier
    string: string
}) => {
    const fileContentBuffer = TEXT_ENCODER.encode(string)
    const hashBuffer = await crypto.subtle.digest(algorithm, fileContentBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')

    return hashHex
}
