import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    css: [
        '@fortawesome/fontawesome-free/css/all.css',
        'bootstrap/dist/css/bootstrap.min.css',
        join(currentDir, './css/main.css'),
    ],
    devtools: { enabled: true },
    modules: ['@pinia/nuxt', 'nuxt-echarts'],
    vite: {
        optimizeDeps: {
            include: [
                '@tensorflow/tfjs-core/dist/types',
                '@tensorflow/tfjs',
                '@vanillaes/csv',
                '@vueuse/rxjs',
                'danfojs/dist/danfojs-base',
                'dexie',
                'echarts/charts',
                'echarts/components',
                'echarts/core',
                'echarts/features',
                'echarts/renderers',
                'luxon',
                'vuedraggable',
            ],
        },
    },

    // modules
    echarts: {
        charts: ['LineChart'],
        components: [
            'TitleComponent',
            'TooltipComponent',
            'LegendComponent',
            'ToolboxComponent',
            'GridComponent',
            'DataZoomComponent',
            'MarkLineComponent',
            'MarkPointComponent',
            'MarkAreaComponent',
        ],
        // ssr: true,
    },
})
