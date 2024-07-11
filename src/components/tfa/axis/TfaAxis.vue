<template>
    <div class="col-auto axis-annotation-col me-auto my-auto" :style="{background: axis.color}">
        <label class="axis-annotation-label">
            {{ axis.name }}
        </label>
    </div>
    <div class="col-auto m-0 p-0">
        <button class="m-0 py-0 pe-1" >
            <i class="fa-solid fa-pen-to-square axis-annotation-icon" @click="editAxis"></i>
        </button>
        <div class="col-auto my-auto">
            <label class="switch">
                <input type="checkbox" v-model="selected" @change="toggleAxis" v-show="false">
                <span class="slider round"></span>
            </label>
        </div>
    </div>
</template>

<script>

export default {
    name: "TfaAxis",
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
        editAxis(event) {
            event.stopPropagation();
            this.$emit("editAxis", this.axis);
        }
    },
    emits: ["editAxis"],
}
</script>

<style scoped>
.col-auto {
    display: inline-flex;
}
button {
    background-color: rgb(255, 255, 255, 0);
    border: 0;
}

i {
    margin-bottom: 0px;
}
</style>