<template>
    <div class="container-fluid d-flex h-100 flex-column">
        <TfaViewHeader title="TF Annotator" />
        <div class="row h-100 mt-2">
            <div class="col col-lg-2 col-md-2 col-sm-12 col-12">
                <TfaViewLeftSidebar
                    v-if="isSidebarVisible"
                    @reloadGraph="reloadGraph"
                />
            </div>
            <div class="col col-lg-8 col-md-8 col-sm-12 col-12">
                <div class="graphDiv">
                    <TfaGraph
                        v-if="isGraphVisible"
                        ref="graphRef"
                        class="chart"
                        @loading="onGraphLoadingStateChange"
                    />
                    <TfaGraphPlaceholder v-if="!isGraphVisible" />
                    <div
                        v-if="isGraphLoading && isGraphVisible"
                        id="spinner"
                        class="spinner-border spinner-border-lg"
                    ></div>
                </div>
            </div>
            <div class="col col-lg-2 col-md-2 col-sm-12 col-12">
                <TfaViewRightSidebar v-if="isSidebarVisible" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const {
    isGraphLoading,
    isGraphVisible,
    onGraphLoadingStateChange,
    reloadGraph,
} = useGraph()
const { isSidebarVisible } = useSidebar()
</script>

<style scoped>
.graphDiv {
    height: 100%;
}

#spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 10;
}
</style>
