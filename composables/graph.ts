import TfaGraph from '../components/tfa/graph/TfaGraph.vue'

export const useGraph = () => {
    const store = useTfAnnotatorStore()
    const graphRef = ref<typeof TfaGraph>()
    const reload = () => {
        graphRef.value?.updateGraph()
    }
    const isLoading = ref(false)
    const onLoadingStateChange = (loadingState: boolean) => {
        isLoading.value = loadingState
    }

    return {
        isGraphLoading: isLoading,
        isGraphVisible: store.isGraphVisible,
        onGraphLoadingStateChange: onLoadingStateChange,
        reloadGraph: reload,
    }
}
