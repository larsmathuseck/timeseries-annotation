<template>
    <div class="modal fade" ref="labelModal" tabindex="-1" aria-hidden="false">
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add Label</h5>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <AddLabel :key="addLabelKey" :labelToEdit="labelToEdit" @labelCreated="onLabelCreated" @labelEdited="labelEdited" @closeModal="closeModal" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AddLabel from "./AddLabel.vue"
import { Modal } from 'bootstrap'

export default {
    name: "LabelModal",
    components: {
        AddLabel,
    },
    props: {
        toggleModalVisibility: Boolean,
        labelToEdit: Object,
        addLabelKey: Number,
    },
    data() {
        return {
            modal: null,
        }
    },
    methods: {
        closeModal: function() {
            this.modal.hide();
        },
        onLabelCreated(label) {
            this.$store.commit('addLabel', label);
            this.modal.hide();
        },
        labelEdited(label) {
            this.$store.commit('editLabel', label);
            this.modal.hide();
        }
    },
    watch: {
        toggleModalVisibility: function() {
            this.modal.show();
        },
    },

    mounted() {
        this.modal = new Modal(this.$refs.labelModal)
    },
}
</script>

<style scoped>
.modal-body {
    padding: 0px;
}
</style>