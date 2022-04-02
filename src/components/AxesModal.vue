<template>
    <div class="modal fade" ref="axesModal" tabindex="-1" aria-hidden="false">
        <div class="modal-dialog modal-dialog-centered modal-m">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{this.title}}</h5>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <AddAxis :axisToEdit="axisToEdit" @closeModal="closeModal"></AddAxis>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Modal } from 'bootstrap'
import AddAxis from "./AddAxis.vue"

export default {
    name: "AxesModal",
    components: {
        AddAxis,
    },
    props: {
        toggleModalVisibility: Boolean,
        axisToEdit: Object,
        title: String,
    },
    data() {
        return {
            modal: null,
        }
    },
    methods: {
        closeModal() {
            this.modal.hide();
        },
    },
    watch: {
        toggleModalVisibility() {
            this.modal.show();
        },
    },

    mounted() {
        this.modal = new Modal(this.$refs.axesModal)
    },
}
</script>

<style scoped>
.modal-body {
    padding: 0px;
}
</style>