import { useObservable, from } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'

export const useSidebar = () => {
    const store = useTfaStore()
    const isSidebarVisible = ref(false)
    const annotationFiles = useObservable(
        from(liveQuery(async () => await database.annotationFile.toArray())),
    )
    const updateShowSidebars = () => {
        if (
            Object.keys(store.dataFiles).length ||
            annotationFiles.value?.length
        ) {
            isSidebarVisible.value = true
        } else {
            isSidebarVisible.value = false
        }
    }
    watch(annotationFiles, updateShowSidebars)
    watch(store.dataFiles, updateShowSidebars, { deep: true })

    return {
        isSidebarVisible,
    }
}
