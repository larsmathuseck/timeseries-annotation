<template>
    <div class="col-auto me-auto" :style="{background: axis.color}">
        <label>
            {{ axis.name }}
        </label>
    </div>
    <div class="col-auto">
        <button>
            <i class="fa-solid fa-pen-to-square" @click="editAxis"></i>
        </button>
        <label class="switch my-auto">
            <input type="checkbox" v-model="selected" @change="toggleAxis" v-show="false">
            <span class="slider round"></span>
        </label>
    </div>
</template>

<script>

export default {
    name: "Axis",
    props: {
        axis: Object,
        isSelected: Boolean,
    },
    data() {
        return {
            selected: this.isSelected,
        }
    },
    watch: {
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
        editAxis: function(event) {
            event.stopPropagation();
            this.$emit("editAxis", this.axis);
        }
    },
    emits: ["editAxis"],
}
</script>

<style scoped>
.col-auto {
    border-radius: 10px;
    margin: 0px;
    padding: 0px;
    display: inline-flex;
}

label {
    font-size: 0.9rem;
    color: white;
    padding: 4px;
    margin: 0px;
}

button {
    background-color: rgb(255, 255, 255, 0);
    border-color: rgb(255, 255, 255, 0);
}
</style>