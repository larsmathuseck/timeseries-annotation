<template>
    <div class="col-auto"
    :style="{ background: label.color }">
        <label>
            {{ label.name }}
        </label>
    </div>
    <div id="label-active-container" class="col-auto me-auto">
        <label class="label-active" v-show="label.id === activeLabel.id">
            Active
        </label>
    </div>
    <div class="col-auto">
        <button>
            <i class="fa fa-edit" @click="editLabel(label)" />
        </button>   
        <button>
            <i class="fa fa-times" @click="deleteLabel(label)" />
        </button>
    </div>
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
            this.$store.commit("deleteLabel", label);
        },
        editLabel: function(label) {
            this.$emit("editLabel", label);
        }
    },
}
</script>

<style scoped>
.col-auto {
    text-align: center;
    width: fit-content;
    height: fit-content;
    border-radius: 10px;
    margin: 0px;
    padding: 0px;
    display: inline-block;
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

#label-active-container {
    text-align: right;
}

button {
    text-align: center;
    background-color: rgb(255, 255, 255, 0);
    border-color: rgb(255, 255, 255, 0);
}

.fa {
    margin-top: 8px;
}
</style>