<template>
    <div class="row">
        <p @click="test" class="description-text" >Add Y-Axis</p>
        <p class="description-text-sm">Add Y-axis to show</p>
        <div class="selec" >
            <select class="form-select" v-model="selected">
                <option v-for="axis in axes" :key="axis.id" >
                    {{ axis.name }}
                </option>
            </select>
        </div>
    </div>
    <div class="row">
        <p class="description-text" >Selected Axis</p>
    </div>
    <div class="row">
        <p class="description-text" >Annotation Files</p>
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
    },
    methods: {
        test() {
            console.log("click")
        }
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