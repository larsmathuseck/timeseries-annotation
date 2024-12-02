import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'

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
    nitro: {
        database: {
            default: {
                connector: 'sqlite',
                options: { name: ':memory:' },
            },
        },
        experimental: {
            database: true,
        },
    },
    runtimeConfig: {
        public: {
            tfa: {
                annotationColumnNames: 'annotation,annotations,label,labels',
                dataHeaderTimestampName: 'timestamp',
                hashAlgorithm: 'SHA-1',
            },
        },
    },
    vite: {
        optimizeDeps: {
            exclude: ['vee-validate'],
            include: [
                '@iconify/vue',
                '@tensorflow/tfjs-core/dist/types',
                '@tensorflow/tfjs',
                '@vanillaes/csv',
                '@vee-validate/zod',
                '@vueuse/core',
                '@vueuse/rxjs',
                'class-variance-authority',
                'clsx',
                'danfojs/dist/danfojs-base',
                'debounce',
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
        plugins: [
            Components({
                dts: '.nuxt/components-icons.d.ts',
                resolvers: [IconsResolver()],
            }),
            Icons({
                scale: 1.5,
            }),
        ],
    },
    $development: {
        devtools: { enabled: true },
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
    eslint: {
        config: {
            typescript: true,
        },
    },
    shadcn: {
        prefix: '',
        componentDir: './components/ui',
    },
})
