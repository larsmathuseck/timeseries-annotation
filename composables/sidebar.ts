import { useObservable, from } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'

import { db } from '../db'

export const useSidebar = () => {
    const store = useTfAnnotatorStore()
    const isSidebarVisible = ref(false)
    const annotationFiles = useObservable(
        from(liveQuery(async () => await db.annotations.toArray())),
    )
    const updateShowSidebars = () => {
        if (Object.keys(store.data).length || annotationFiles.value?.length) {
            isSidebarVisible.value = true
        } else {
            isSidebarVisible.value = false
        }
    }
    watch(annotationFiles, () => updateShowSidebars())
    watch(store.data, () => updateShowSidebars(), { deep: true })

    return {
        isSidebarVisible,
    }
}
