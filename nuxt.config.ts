import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
    build: {
        transpile: ['vue-echarts'],
    },
    compatibilityDate: '2024-04-03',
    css: [
        '@fortawesome/fontawesome-free/css/all.css',
        'bootstrap/dist/css/bootstrap.min.css',
        join(currentDir, './css/main.css'),
    ],
    devtools: { enabled: true },
    modules: ['@pinia/nuxt'],
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
                'echarts/renderers',
                'luxon',
                'vuedraggable',
            ],
        },
    },
})
