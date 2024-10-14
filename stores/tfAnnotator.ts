import { parse } from '@vanillaes/csv'
import { breakDownToSamplingrate } from '../util/model/instance'

export const useTfAnnotatorStore = defineStore('tf-annotator', () => {
    const colors = ref([
        'red',
        'orange',
        'olive',
        'green',
        'teal',
        'blue',
        'violet',
        'purple',
        'pink',
        'brown',
        'grey',
    ])
    const data = ref<
        Record<
            number,
            {
                axes: Record<
                    number,
                    {
                        color: string
                        dataPoints: unknown
                        id: number
                        name: string
                        samplingRate?: number
                    }
                    // | undefined
                >
                id: string | number
                name: string
                selectedAxes: number[]
                timestamps: number[]
            }
        >
    >({})
    const dataSelector = ref<number>()
    const isAreasVisible = ref(false)
    const labelActive = ref<{ id: number }>()

    // internal
    const _isDataAvailable = computed(() => Object.keys(data.value).length > 0)
    const _dataSelected = computed(() =>
        _isDataAvailable.value && dataSelector.value
            ? data.value[dataSelector.value]
            : undefined,
    )

    const axesSelected = computed(() => _dataSelected.value?.axes || [])
    const dataSelected = computed(() =>
        _isDataAvailable.value && dataSelector.value
            ? Object.fromEntries(
                  Object.entries(data.value[dataSelector.value].axes).filter(
                      (key) =>
                          dataSelector.value
                              ? data.value[
                                    dataSelector.value
                                ].selectedAxes.includes(key[1].id)
                              : false,
                  ),
              )
            : [],
    )
    const isGraphVisible = computed(() => _isDataAvailable.value)
    const timestampsSelected = computed(
        () => _dataSelected.value?.timestamps || [],
    )
    const axesSelectedSelected = computed(
        () => _dataSelected.value?.selectedAxes || [],
    ) // TODO: wrap head around double selection

    const addAxis = (payload: {
        axis: { id: number }
        color: string
        feature: { id: number }
        name: string
        samplingRate: number
    }) => {
        const axes = axesSelected.value
        const axisData = axes[payload.axis.id].dataPoints
        const { segmentTimestamps, result } = breakDownToSamplingrate(
            [axisData],
            timestampsSelected.value,
            payload.samplingRate,
            payload.feature.id,
        )
        const dataBreakdown = result?.map((x) => {
            return [segmentTimestamps[result.indexOf(x)], x[0]]
        })
        const keys = Object.keys(axes)
        const id = parseInt(keys[keys.length - 1]) + 1
        const axis = {
            id,
            name: payload.name,
            dataPoints: dataBreakdown,
            color: payload.color,
            samplingRate: payload.samplingRate,
            feature: payload.feature,
        }

        Object.assign(axes, { [id]: axis })

        if (dataSelector.value) {
            data.value[dataSelector.value].selectedAxes.push(axis.id)
        }
    }
    const addData = (payload: { result: string; name: string }) => {
        const _data = parse(payload.result)
        const legend = _data.shift()
        const timestamps: number[] = []
        const axes: Record<
            number,
            {
                dataPoints: unknown[]
            }
        > = {}

        // Get Timestamps and create axes object
        let timestampLocation = -1
        let axesId = 0
        for (let i = 0; i < legend.length; i++) {
            if (legend[i].toLowerCase() === 'timestamp') {
                timestampLocation = i
            } else {
                Object.assign(axes, {
                    [axesId]: {
                        id: axesId,
                        name: legend[i],
                        dataPoints: [],
                        color: colors.value[i % colors.value.length],
                    },
                })
                axesId += 1
            }
        }
        if (timestampLocation >= 0) {
            _data.forEach((row) => {
                timestamps.push(new Date(row[timestampLocation]).getTime())
                row.splice(timestampLocation, 1)
            })

            // Delete last not full second
            const lastTimestamp =
                timestamps[timestamps.length - 1] -
                ((timestamps[timestamps.length - 1] - timestamps[0]) % 1000)
            let time: number | undefined = timestamps[timestamps.length - 1]
            while (time && time > lastTimestamp) {
                if (timestamps[timestamps.length - 2] <= lastTimestamp) {
                    break
                }
                time = timestamps.pop()
            }
            // Get dimensions in own arrays
            for (let row = 0; row < timestamps.length; row++) {
                for (let column = 0; column < _data[row].length; column++) {
                    axes[column].dataPoints.push([
                        new Date(timestamps[row]).getTime(),
                        _data[row][column],
                    ])
                }
            }
            let id = 0
            if (Object.keys(data.value).length > 0) {
                const keys = Object.keys(data.value)
                id = parseInt(keys[keys.length - 1]) + 1
            }
            Object.assign(data.value, {
                [id]: {
                    id,
                    name: payload.name,
                    axes,
                    timestamps,
                    selectedAxes: [parseInt(Object.keys(axes)[0])],
                },
            })
            dataSelector.value = id
        }
    }
    const addSelectedAxis = (axis: { id: number }) => {
        axesSelectedSelected.value.push(axis.id)
    }
    const removeAxis = (payload: { id: number }) => {
        delete axesSelected.value[payload.id]
        const _selectedAxes = axesSelectedSelected.value
        const _axes = axesSelected.value
        if (_selectedAxes.length === 1 && _selectedAxes[0] === payload.id) {
            const id = Object.keys(_axes)[0]
            _selectedAxes.push(parseInt(id))
        }
        if (_selectedAxes.includes(payload.id)) {
            _selectedAxes.splice(_selectedAxes.indexOf(payload.id), 1)
        }
    }
    const removeData = () => {
        if (dataSelector.value) {
            delete data.value[dataSelector.value]
        }

        if (Object.keys(data.value).length > 0) {
            dataSelector.value = parseInt(Object.keys(data.value)[0])
        } else {
            dataSelector.value = undefined
        }
    }
    const removeSelectedAxis = (axis: { id: number }) => {
        const index = axesSelectedSelected.value.indexOf(axis.id)
        if (index > -1) {
            axesSelectedSelected.value.splice(index, 1)
        }
    }
    const selectDataFile = (dataFileId: number) => {
        dataSelector.value = dataFileId
    }
    const toggleAreasVisibility = () => {
        isAreasVisible.value = !isAreasVisible.value
    }
    const updateAxis = (payload: {
        id: number
        name: string
        color: string
    }) => {
        axesSelected.value[payload.id].name = payload.name
        axesSelected.value[payload.id].color = payload.color
    }

    return {
        axesSelected,
        axesSelectedSelected,
        colors,
        data,
        dataSelected,
        dataSelector,
        isAreasVisible,
        isGraphVisible,
        labelActive,
        timestampsSelected,

        addAxis,
        addData,
        addSelectedAxis,
        removeAxis,
        removeData,
        removeSelectedAxis,
        selectDataFile,
        toggleAreasVisibility,
        updateAxis,
    }
})
