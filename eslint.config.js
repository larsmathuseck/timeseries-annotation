// @ts-check

import { withNuxt } from './.nuxt/eslint.config.mjs'

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
const prettierConfiguration = eslintPluginPrettierRecommended

export default withNuxt([
    prettierConfiguration, // must be last
    {
        ignores: ['components/ui'],
    },
])
