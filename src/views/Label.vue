<template>
    <div class="col-auto"
    :style="{ background: label.color }">
        <p>
            {{ label.name }}
        </p>
    </div>
</template>

<script>
export default {
    name: "Label",
    props: {
        label: Object,
    },
    methods: {

    }
}
</script>

<style scoped>
.col-auto {
    border-radius: 10px;
    height: fit-content;
    width: fit-content;
    margin: 0px;
    margin-left: 10px;
}

p {
    font-family: Tahoma;
    font-size: 1rem;
    font-weight: bold;
    color: white;
    padding: 5px;
}
</style>