export interface Axis {
    color: string
    dataPoints: number[][]
    id: number
    isSelected?: boolean
    name: string
    samplingRate?: number
}

export interface DataFile {
    axes: Record<number, Axis>
    hash: string
    id: string // synonymous to hash now
    name: string
    timestamps: readonly number[]
}

export const useTfaStore = defineStore('tf-annotator', () => {
    const runtimeConfig = useRuntimeConfig()

    // data
    const dataFiles = ref<Record<string, DataFile>>({})
    const dataFileSelectedId = ref<string>()
    const isAreasVisible = ref<boolean>()
    const labelActive = ref<{ id: number }>()

    // computations
    const isDataFileAvailable = computed(
        () => !!Object.keys(dataFiles.value).length,
    )
    const _dataFileSelected = computed(() =>
        dataFileSelectedId.value && dataFileSelectedId.value in dataFiles.value
            ? dataFiles.value[dataFileSelectedId.value]
            : undefined,
    )
    const dataFileSelectedAxes = computed(
        () => _dataFileSelected.value?.axes || [],
    )
    const dataFileSelectedTimestamps = computed(
        () => _dataFileSelected.value?.timestamps || [],
    )

    const getNextAxisId = (axes: Record<number, Axis | DataFile>): number => {
        const keys = Object.keys(axes)
        return keys.length > 0 ? parseInt(keys[keys.length - 1]) + 1 : 0
    }

    const axisAdd = (payload: {
        axis: { id: number }
        color: string
        feature: { id: number }
        name: string
        samplingRate: number
    }) => {
        const axes = dataFileSelectedAxes.value
        const axisData = axes[payload.axis.id].dataPoints
        const { segmentTimestamps, result } = breakDownToSamplingrate({
            dataPoints: [axisData],
            timestamps: dataFileSelectedTimestamps.value,
            samplingRate: payload.samplingRate,
            featureIndex: payload.feature.id,
        })
        const dataBreakdown = result?.map((x, i) => [
            segmentTimestamps[i],
            x[0],
        ])

        if (!dataBreakdown) return

        const newAxis: Axis = {
            color: payload.color,
            dataPoints: dataBreakdown,
            id: getNextAxisId(axes),
            isSelected: true,
            name: payload.name,
            samplingRate: payload.samplingRate,
        }

        Object.assign(axes, { [newAxis.id]: newAxis })
    }

    const dataFileAdd = ({
        csv,
        fileHash,
        fileName,
    }: {
        csv: string[][]
        fileHash: string
        fileName: string
    }) => {
        const headerRow = getHeaderRow(csv) || []

        const timestampIndex = headerRow.findIndex(
            (header) =>
                header.toLowerCase() ===
                runtimeConfig.public.tfa.dataHeaderTimestampName,
        )

        const headerRowWithoutTimestamp = headerRow.filter(
            (_, index) => index !== timestampIndex,
        )

        const axes = headerRowWithoutTimestamp.reduce(
            (axes, name, i) => {
                axes[i] = {
                    color: COLORS[i % COLORS.length],
                    dataPoints: [],
                    id: i,
                    isSelected: i === 0,
                    name,
                }
                return axes
            },
            {} as Record<number, Axis>,
        )

        const timestamps: number[] = []

        if (timestampIndex >= 0) {
            for (const [index, row] of csv.entries()) {
                if (!index) continue

                timestamps.push(new Date(row[timestampIndex]).getTime())
                row.splice(timestampIndex, 1)
            }

            // delete last not full second
            const lastValidTimestamp =
                timestamps[timestamps.length - 1] -
                ((timestamps[timestamps.length - 1] - timestamps[0]) % 1000)
            while (
                timestamps.length > 0 &&
                timestamps[timestamps.length - 1] > lastValidTimestamp
            ) {
                timestamps.pop()
            }

            for (
                let columnIndex = 0;
                columnIndex < headerRowWithoutTimestamp.length;
                columnIndex++
            ) {
                for (
                    let rowIndex = 0;
                    rowIndex < timestamps.length;
                    rowIndex++
                ) {
                    const timestamp = timestamps[rowIndex]
                    axes[columnIndex].dataPoints.push([
                        timestamp,
                        parseFloat(csv[rowIndex + 1][columnIndex]),
                    ])
                }

                Object.freeze(axes[columnIndex].dataPoints)
            }

            dataFiles.value[fileHash] = {
                axes,
                hash: fileHash,
                id: fileHash,
                name: fileName,
                timestamps: Object.freeze(timestamps),
            }
            dataFileSelectedId.value = fileHash
        }
    }

    const axisRemove = (axisId: number) => {
        // debugger

        const axes = dataFileSelectedAxes.value
        const axesSelected = Object.entries(axes)
            .map(([_id, axis]) => (axis.isSelected ? axis : undefined))
            .filter((x) => !!x)
            .filter((x) => x.isSelected) // dataFileSelectedAxesSelected.value
        delete axes[axisId] // eslint-disable-line @typescript-eslint/no-dynamic-delete

        // Ensure at least one axis is selected
        if (axesSelected.length === 1 && axesSelected[0].id === axisId) {
            // const firstAvailableAxis =  // parseInt()
            axesSelected.push(axes[0]) // Object.keys(axes)[0]
        }
        // axesSelected.splice(axesSelected.indexOf(axisId), 1)
    }

    const dataFileRemove = () => {
        if (dataFileSelectedId.value) {
            delete dataFiles.value[dataFileSelectedId.value] // eslint-disable-line @typescript-eslint/no-dynamic-delete
        }

        const dataFileIdsRemaining = Object.keys(dataFiles.value)
        dataFileSelectedId.value = dataFileIdsRemaining.length
            ? dataFileIdsRemaining[0]
            : undefined
    }

    const toggleAreasVisibility = () => {
        isAreasVisible.value = !isAreasVisible.value
    }

    const axisUpdate = (payload: {
        id: number
        name: string
        color: string
    }) => {
        const axis = dataFileSelectedAxes.value[payload.id]
        if (axis) {
            axis.name = payload.name
            axis.color = payload.color
        }
    }

    return {
        // state and computed properties
        dataFiles,
        dataFileSelectedAxes,
        dataFileSelectedId,
        dataFileSelectedTimestamps,
        isAreasVisible,
        isDataFileAvailable,
        labelActive,

        // methods
        axisAdd,
        axisRemove,
        axisUpdate,
        dataFileAdd,
        dataFileRemove,
        toggleAreasVisibility,
    }
})
