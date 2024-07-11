<template>
    <div class="row absolute">
        <div class="col">
            <span class="dot" v-for="color in colors" :key="color" :style="{ background: color }" @click="colorPicked(color)" />
        </div>
    </div>
</template>

<script>

export default {
    name: "TfaColorPicker",
    props: {
        colorForAxis: Boolean,
    },
    data() {
        return {
            colors: this.$store.state.colors,
        }
    },
    methods: {
        colorPicked(color) {
            if (this.colorForAxis) {
                this.$emit("axisColorPicked", color)
            } else {
                this.$emit("labelColorPicked", color)
            }
        }
    },
    emits: ["axisColorPicked", "labelColorPicked"],
}
</script>


<style scoped>
.dot {
    height: 35px;
    width: 35px;
    background-color: #bbb;
    border-radius: 50%;
    display: inline-block;
    margin: 3px;
    transition: all .2s ease-in-out;
}

.dot:hover {
    transform: scale(1.25);
}

.col {
    background-color: #f5f5f5;
    background-clip: content-box;
    z-index: 10;
}
</style>