<template>
    <div class="col-auto"
    :style="{ background: label.color }">
        <p>
            {{ label.name }}
        </p>
    </div>
    <p class="label-active" v-show="label.id === activeLabel?.id">
        Active
    </p>
</template>

<script>
export default {
    name: "Label",
    props: {
        label: Object,
    },
    computed: {
        activeLabel: function() {
            return this.$store.state.activeLabel;
        }
    }
}
</script>

<style scoped>
.col-auto {
    border-radius: 10px;
    height: fit-content;
    width: fit-content;
    margin: 0px;
    margin-left: 0px;
    float:left; 
    align-items: center;
}

p {
    font-family: Tahoma;
    font-size: 1rem;
    font-weight: bold;
    color: white;
    padding: 5px;
    margin: 0px;
}

.label-active {
    text-align: right;
    color: rgb(128, 128, 128, 0.5);
}
</style>