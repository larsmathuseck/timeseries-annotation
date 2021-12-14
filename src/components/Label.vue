<template>
    <div class="col-auto"
    :style="{ background: label.color }">
        <label>
            {{ label.name }}
        </label>
    </div>
    <div id="label-active-container" class="col-auto me-auto">
        <label class="label-active" v-show="activeLabel != null && label.id === activeLabel.id">
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
    emits: ["editLabel"],
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

label {
    font-family: Tahoma;
    font-size: 1vw;
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
    background-color: rgb(255, 255, 255, 0);
    border: 0px;
    padding: 0 3px 0 3px;
}

.fa {
    font-size: 1.25vw;
}
</style>