<template>
    <div class="flex flex-col gap-1">
        <div class="flex items-baseline gap-1">
            <span class="text-4xl font-bold">
                {{ count ?? '?' }}
            </span>
            <span v-if="count === undefined">loading</span>
            <span
                v-else-if="isOptional && !count"
                class="text-muted-foreground"
            >
                optional
            </span>
        </div>
        <div class="flex gap-2 items-center">
            <div class="flex items-baseline gap-1">
                <span class="text-xl font-bold">{{ title }}</span>
                <!-- <span class="text-muted-foreground">required</span> -->
            </div>

            <template v-if="count || isOptional">
                <!-- <span v-if="!count">optional</span> -->
                <IHeroiconsCheck />
            </template>
            <!-- <template v-else-if="!count">
                <span>add some above! 👆</span>
            </template> -->
            <template v-else>
                <IHeroiconsXMark />
            </template>
        </div>
        <!-- <div class="flex items-center gap-1">
            <template v-if="isOptional">
                <span v-if="!count">optional</span>
                <IHeroiconsCheck />
            </template>
            <template v-else-if="!count">
                <span>add some above! 👆</span>
            </template>
            <template v-else>
                <IHeroiconsCheck />
            </template>
        </div> -->
        <slot />
    </div>
</template>

<script setup lang="ts">
interface Props {
    count?: number
    title: string
    isOptional?: boolean
}
withDefaults(defineProps<Props>(), {
    count: undefined,
    isOptional: undefined,
})
</script>
