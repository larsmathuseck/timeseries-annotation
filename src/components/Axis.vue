<template>
    <div class="col-auto me-auto" :style="{background: axis.color}">
        <label>
            {{ axis.name }}
        </label>
    </div>
    <div class="col-auto">
        <button>
            <i class="fa fa-tint"  @click="showColorPicker = !showColorPicker" />
        </button>
        <label class="switch">
            <input type="checkbox" v-model="selected" @change="toggleAxis">
            <span class="slider round"></span>
        </label>
    </div>
    <div class="colorpicker-container" id="colorpicker-con">
        <ColorPicker @axisColorPicked="setSelectedAxisColor" v-show="showColorPicker" :colorForAxis="true" />
    </div>
</template>

<script>
import ColorPicker from "./Colorpicker.vue"

export default {
    name: "Axis",
    components: {
        ColorPicker,
    },
    props: {
        axis: Object,
        isSelected: Boolean,
    },
    data() {
        return {
            showColorPicker: false,
            selected: this.isSelected,
        }
    },
    watcher: {
        isSelected: function() {
            this.selected = this.isSelected
        }
    },
    methods: {
        toggleAxis() {
            if (this.selected) {
                this.$store.commit("addSelectedAxes", this.axis);
            } else {
                if (this.$store.getters.selectedAxes.length <= 1) {
                    this.selected = true;
                    alert("At least 1 axis must be selected!")
                    return;
                }
                this.$store.commit("deleteSelectedAxis", this.axis);
            }
        },
        setSelectedAxisColor(color) {
            let newAxis = this.axis;
            newAxis.color = color;
            this.$store.commit("changeAxisColor", newAxis);
            this.showColorPicker = false;
        },
        /*mounted() {
        window.addEventListener("load", this.onWindowLoad);
        },*/
    },
}
/*
const colorContainer = document.getElementById("colorpicker-con");
document.onclick=function(mouseClick) {
    console.log(mouseClick.target.id)
    console.log(colorContainer.id)
    if (mouseClick.target.id != colorContainer.id && this.showColorPicker) {
        console.log("false")
        this.showColorPicker = false;
        console.log(this.showColorPicker)
    }
}*/
</script>

<style scoped>
.col-auto {
    text-align: center;
    width: fit-content;
    height: fit-content;
    border-radius: 10px;
    margin: 0px;
    padding: 0px;
}

label {
    font-family: Tahoma;
    font-size: 1rem;
    color: white;
    padding: 5px;
    margin: 0px;
}

button {
    text-align: center;
    background-color: rgb(255, 255, 255, 0);
    border-color: rgb(255, 255, 255, 0);
}

.fa {
    margin-top: 8px;
    color: #2196F3;
}

.colorpicker-container {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    width: 100%;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>