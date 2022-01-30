<template>
    <div class="modal fade" ref="labelModal" tabindex="-1" aria-hidden="false">
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirm</h5>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Confirm?
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" @click="confirmClicked">Save changes</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Modal } from 'bootstrap'

export default {
    name: "ConfirmModal",
    components: {
    },
    props: {
        toggleModalVisibility: Boolean,
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
        confirmClicked: function() {
            this.$emit("modalConfirm", true);
        },
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