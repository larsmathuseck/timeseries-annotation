<template>
    <div class="col-auto"
    :style="{ background: label.color }">
        <label>
            {{ label.name }}
        <i @click="deleteLabel(label)" class="fa fa-times"></i>
        </label>
    </div>
    <label class="label-active" v-show="label.id === activeLabel.id">
        Active
    </label>
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
    },
    methods: {
        deleteLabel: function(label) {
            this.$store.commit("deleteLabel", label)
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

label {
    font-family: Tahoma;
    font-size: 1rem;
    font-weight: bold;
    color: white;
    padding: 5px;
    margin: 0px;
}

.label-active {
    text-align: right;
    display: block;
    color: rgb(128, 128, 128, 0.5);
}
</style>