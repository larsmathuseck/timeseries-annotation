<template>
    <form class="flex flex-col gap-4">
        <FormField v-slot="{ componentField }" name="axis">
            <FormItem>
                <FormLabel>Axis</FormLabel>
                <Select v-bind="componentField">
                    <SelectTrigger :disabled="isEditing">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem
                                v-for="axis in axes"
                                :key="axis.id"
                                :value="axis.name"
                            >
                                {{ axis.name }}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="method">
            <FormItem>
                <FormLabel>Method</FormLabel>
                <Select v-bind="componentField">
                    <SelectTrigger :disabled="isEditing">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem
                                v-for="feature in features"
                                :key="feature.id"
                                :value="feature.name"
                            >
                                {{ feature.name }}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="samplingRate">
            <FormItem>
                <FormLabel>Sampling Rate</FormLabel>
                <FormControl>
                    <Input
                        :disabled="isEditing"
                        v-bind="componentField"
                        type="number"
                        required
                    />
                </FormControl>
                <FormDescription />
                <FormMessage />
            </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="axisColor">
            <FormItem>
                <FormLabel>Axis Color</FormLabel>
                <FormControl>
                    <div class="flex">
                        <Input
                            :disabled="isEditing"
                            v-bind="componentField"
                            required
                        />
                        <Button
                            size="icon"
                            type="button"
                            variant="outline"
                            @click="toggleColorPicker"
                        >
                            <IHeroiconsEyeDropper />
                        </Button>
                    </div>
                </FormControl>
                <FormDescription />
                <FormMessage />

                <TfaColorPicker
                    v-show="showColorPicker"
                    @color-picked="colorPicked"
                />
            </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="axisName">
            <FormItem>
                <FormLabel>Axis Name</FormLabel>
                <FormControl>
                    <Input
                        :disabled="isEditing"
                        v-bind="componentField"
                        required
                    />
                </FormControl>
                <FormDescription />
                <FormMessage />
            </FormItem>
        </FormField>

        <!-- <div>
            <label for="axisColorInput">Axis Color</label>
            <div>
                <div>
                    <input
                        id="axisColorInput"
                        v-model="axisColor"
                        type="text"
                        required
                    />
                </div>
            </div>
        </div> -->
        <!-- <div>
            <label for="axisNameInput">Axis Name</label>
            <div>
                <input
                    id="axisNameInput"
                    v-model="axisName"
                    type="text"
                    required
                />
            </div>
        </div> -->
        <div v-if="error" role="alert">
            {{ error }}
        </div>
        <DialogFooter>
            <DialogClose as-child>
                <Button
                    v-if="axisToEdit"
                    type="button"
                    variant="destructive"
                    @click="deleteAxis"
                >
                    Delete
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    @click="$emit('closeModal')"
                >
                    Close
                </Button>
            </DialogClose>
            <Button type="submit" @click="onSubmit">Save</Button>
        </DialogFooter>
    </form>
</template>

<script setup lang="ts">
export interface Props {
    axisToEdit: {
        color: string
        feature: Feature
        id: number
        name: string
        samplingRate?: number
    }
}
const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
    closeModal: []
    reloadGraph: []
}>()

const store = useTfaStore()

// data
const selectedAxis = ref<{
    id: number
    name: string
}>()
const selectedFeature = ref(FEATURES[0])
const axisColor = ref('blue')
const samplingRate = ref(32)
const showColorPicker = ref(false)
const axisName = ref<string>()
const error = ref<string>()

// computations
const isEditing = computed(() => !!props.axisToEdit)
const features = computed(() => FEATURES)
const axes = computed(() => {
    if (isEditing.value) {
        return store.dataFileSelectedAxes
    } else {
        return Object.values(store.dataFileSelectedAxes).filter(
            (axis) => !axis.samplingRate,
        )
    }
})

// methods
const colorPicked = (color: string) => {
    axisColor.value = color
    showColorPicker.value = false
}
const onSubmit = (e: Event) => {
    e.preventDefault()
    if (!validateInputs() || !axisName.value) return
    if (isEditing.value) {
        store.axisUpdate({
            ...props.axisToEdit,
            name: axisName.value,
            color: axisColor.value,
        })
    } else if (selectedAxis.value) {
        store.axisAdd({
            name: axisName.value,
            axis: selectedAxis.value,
            feature: selectedFeature.value,
            color: axisColor.value,
            samplingRate: samplingRate.value,
        })
    }
    emit('closeModal')
    emit('reloadGraph')
}
const toggleColorPicker = () => {
    showColorPicker.value = !showColorPicker.value
}
const updateAxisName = () => {
    if (
        !isEditing.value &&
        selectedAxis.value &&
        selectedFeature.value &&
        samplingRate.value
    ) {
        axisName.value = `${selectedAxis.value.name}-${selectedFeature.value.shortName}-${samplingRate.value}`
    }
}
const deleteAxis = () => {
    if (Object.keys(store.dataFileSelectedAxes).length <= 1) {
        alert('At least one axis must be selected!')
        return
    }
    store.axisRemove(props.axisToEdit.id)
    emit('closeModal')
}
const validateInputs = () => {
    if (!samplingRate.value || isNaN(samplingRate.value)) {
        error.value = 'Sampling Rate must be a valid number!'
        return false
    }
    if (samplingRate.value < 0) {
        error.value = 'Sampling Rate cannot be negative!'
        return false
    }
    return true
}

// lifecycle
watch(
    () => props.axisToEdit,
    (newAxisToEdit) => {
        if (newAxisToEdit) {
            selectedAxis.value = newAxisToEdit
            selectedFeature.value = newAxisToEdit.feature
            axisColor.value = newAxisToEdit.color
            axisName.value = newAxisToEdit.name
            samplingRate.value = newAxisToEdit.samplingRate || 32
        } else {
            selectedAxis.value = axes.value[0] || null
            selectedFeature.value = features.value[0]
            axisColor.value = 'blue'
            samplingRate.value = 32
            axisName.value = ''
        }
    },
)
watch(axes, (axes) => {
    if (axes !== undefined && Object.entries(axes).length !== 0) {
        selectedAxis.value = axes[0]
        updateAxisName()
    }
})
watch([selectedAxis, selectedFeature, samplingRate], updateAxisName)
</script>
