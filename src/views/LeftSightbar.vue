<template>
    <div class="row">
        <p @click="test" class="description-text" >Add Y-Axis</p>
        <p class="description-text-sm">Add Y-axis to show</p>
        <div class="selec" >
            <select class="form-select" v-model="selected" @change="selectedAxisOnChange($event)">
                <option v-for="axis in axes" :key="axis.id">
                    {{ axis.name }}
                </option>
            </select>
        </div>
    </div>
    <div class="row">
        <p class="description-text" >Selected Axis</p>
        <div class="axes-box" v-for="selectedAxis in this.selectedAxes" :key="selectedAxis.id" >
            {{ selectedAxis.name }}
        </div>
    </div>
    <div class="row">
        <p class="description-text" >Annotation Files</p>
        <p class="description-text-sm">Select file to annotate chart</p>
        <div class="selec" >
            <select class="form-select" v-model="selected">
                <option v-for="annotationFile in annotationFiles" :key="annotationFile.id" >
                    {{ annotationFile.name }}
                </option>
            </select>
        </div>
    </div>
    <div class="row">
        <p class="description-text" >Labels</p>
    </div>
</template>

<script>
export default {
    name: "LeftSightbar",
    props: {
        axes: Array,
        annotationFiles: Array,
    },
    data() {
        return {
            selectedAxes: [],
        }
    },
    methods: {
        selectedAxisOnChange(event) {
            const newSelectedAxisName = event.target.value;
            console.log(newSelectedAxisName)
            const newSelectedAxis = {
                id: this.selectedAxes.length + 1,
                name: newSelectedAxisName,
            }
            const iterator = this.selectedAxes.values();

            for (const axis of iterator) {
                console.log(axis);
                if (axis.name === newSelectedAxisName) {
                    return;
                }
            }
            this.selectedAxes.push(newSelectedAxis)
            console.log(this.selectedAxes)
        },
    },
}
</script>

<style scoped>
.description-text {
    text-align: left;
    font-family: Tahoma;
    font-weight: Bold;
    font-size: 1.5rem;
    margin: 2px;
}

.description-text-sm {
    text-align: left;
    font-family: Tahoma;
    font-size: 1rem;
    margin: 2px;
    color: gray;
}


</style>