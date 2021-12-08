<template>
    <div class="row absolute">
        <div class="col">
            <span class="dot" v-for="color in colors" :key="color" :style="{ background: color }" @click="colorPicked(color)" />
        </div>
    </div>
</template>

<script>

export default {
    name: "Colorpicker",
    props: {
        colorForAxis: Boolean,
    },
    data() {
        return {
            colors: ["red", "orange", "#FFD700", "olive", "green", "teal", "blue", "violet", "purple", "pink", "brown", "grey"],
        }
    },
    methods: {
        colorPicked(color) {
            if (this.colorForAxis) {
                this.$emit("axis-color-picked", color)
            } else {
                this.$emit("labelColorPicked", color)
            }
        }
    },
    emits: ["axis-color-picked", "labelColorPicked"],
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