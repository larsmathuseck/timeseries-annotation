<template>
    <div class="col-auto"
    :style="{ background: selectedAxis.color }">
        <p>
            {{ selectedAxis.name }}
            <i @click="deleteSelectedAxis(selectedAxis)" class="fa fa-times"></i>
        </p>
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
            this.$emit("delete-selected-axis", axis);
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

p {
    font-family: Tahoma;
    font-size: 1rem;
    font-weight: 10%;
    color: white;
    padding: 5px;
}

.fa-times {
   opacity: 0.5;
}

.fa-times:hover {
    opacity: 1;
    cursor: pointer;
}
</style>