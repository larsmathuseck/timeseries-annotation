<template>
    <div class="modal fade" ref="exampleModal" tabindex="-1" aria-hidden="false">
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Add Label</h5>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <AddLabel :labelToEdit="labelToEdit" @labelCreated="onLabelCreated" @labelEdited="labelEdited" @closeModal="closeModal" />
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
        this.modal = new Modal(this.$refs.exampleModal)
    },
}
</script>

<style scoped>
.modal-body {
    padding: 0px;
}
</style>