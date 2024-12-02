<template>
    <div
        class="h-screen w-screen flex flex-col lg:flex-row lg:items-center justify-center p-4 md:p-6 lg:p-8 gap-16 lg:gap-32"
    >
        <div class="flex flex-col items-center">
            <NuxtImg
                src="/icon.png"
                class="dark:invert"
                width="400"
                height="400"
            />
            <span class="text-4xl">TF Annotator</span>
        </div>
        <TfaSetupForm class="lg:w-1/3" />
    </div>
</template>
