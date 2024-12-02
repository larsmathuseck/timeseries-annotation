import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    modules: [
        '@nuxt/eslint',
        '@nuxt/image',
        '@nuxtjs/color-mode',
        '@nuxtjs/tailwindcss',
        '@pinia/nuxt',
        'nuxt-echarts',
        'shadcn-nuxt',
    ],
    vite: {
        optimizeDeps: {
            exclude: ['vee-validate'],
            include: [
                '@tensorflow/tfjs-core/dist/types',
                '@tensorflow/tfjs',
                '@vanillaes/csv',
                '@vee-validate/zod',
                '@vueuse/core',
                '@vueuse/rxjs',
                'class-variance-authority',
                'clsx',
                'danfojs/dist/danfojs-base',
                'dexie',
                'echarts/charts',
                'echarts/components',
                'echarts/core',
                'echarts/features',
                'echarts/renderers',
                'lucide-vue-next',
                'luxon',
                'radix-vue',
                'tailwind-merge',
                'vuedraggable',
                'zod',
            ],
        },
    },

    // modules
    colorMode: {
        classSuffix: '',
    },
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
    shadcn: {
        prefix: '',
        componentDir: './components/ui',
    },
})
