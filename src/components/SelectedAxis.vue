<template>
    <div class="col-auto"
    :style="{ background: selectedAxis.color }">
        <label>
            {{ selectedAxis.name }}
            <i @click="deleteSelectedAxis(selectedAxis)" class="fa fa-times"></i>
        </label>
    </div>
</template>

<script>
export default {
    name: "SelectedAxis",
    props: {
        selectedAxis: Object,
    },
    methods: {
        deleteSelectedAxis(axis) {
            this.$store.commit("deleteSelectedAxis", axis);
        }
    },
}
</script>

<style scoped>
.col-auto {
    border-radius: 10px;
    height: fit-content;
    width: fit-content;
    margin: 0px;
}

label {
    font-family: Tahoma;
    font-size: 1rem;
    font-weight: 10%;
    color: white;
    padding: 5px;
}

</style>