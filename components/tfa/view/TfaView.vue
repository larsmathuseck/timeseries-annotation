<template>
    <div class="flex flex-col min-h-screen">
        <TfaViewHeader title="TF Annotator" />

        <ResizablePanelGroup
            direction="horizontal"
            class="rounded-lg border grow"
        >
            <ResizablePanel :default-size="15" class="p-4">
                <TfaViewSidebarLeft @reload-graph="reloadGraph" />
            </ResizablePanel>
            <ResizableHandle with-handle />
            <ResizablePanel :default-size="70" class="p-4">
                <TfaGraph
                    v-if="isGraphVisible"
                    ref="graphRef"
                    @loading="onGraphLoadingStateChange"
                />

                <div v-if="isGraphLoading && isGraphVisible">
                    <div role="status" aria-live="polite">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            </ResizablePanel>
            <ResizableHandle with-handle />
            <ResizablePanel :default-size="15" class="p-4">
                <TfaViewSidebarRight />
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
</template>

<script setup lang="ts">
const {
    isGraphLoading,
    isGraphVisible,
    onGraphLoadingStateChange,
    reloadGraph,
} = useGraph()
</script>
