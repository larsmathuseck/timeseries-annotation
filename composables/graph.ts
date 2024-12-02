import type TfaGraph from '../components/tfa/TfaGraph.vue'

export const useGraph = () => {
    const store = useTfaStore()
    const { isDataFileAvailable } = storeToRefs(store)

    const graphRef: Ref<typeof TfaGraph | null> = ref(null)
    const reloadGraph = () => {
        graphRef.value?.updateGraph()
    }
    const isGraphLoading = ref(false)
    const onGraphLoadingStateChange = (loadingState: boolean) => {
        isGraphLoading.value = loadingState
    }

    return {
        isGraphLoading,
        isGraphVisible: isDataFileAvailable,
        onGraphLoadingStateChange,
        reloadGraph,
        graphRef,
    }
}
