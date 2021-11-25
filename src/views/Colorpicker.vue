<template>
    <div class="col">
        <span class="dot" v-for="color in colors" :key="color" :style="{ background: color }" @click="axisColorPicked(color)">
        </span>
        
    </div>
</template>

<script>

export default {
    name: "Colorpicker",
    props: {
        colors: Array,
    },
    methods: {
        axisColorPicked(color) {
            this.$emit("axis-color-picked", color)
        }
    }
    
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
}
</style>