<template>
    <div class="modal fade" ref="labelModal" tabindex="-1" aria-hidden="false">
        <div class="modal-dialog modal-dialog-centered modal-m">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add Axis</h5>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <AddAxis @labelCreated="onLabelCreated" @labelEdited="labelEdited" @closeModal="closeModal"></AddAxis>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Modal } from 'bootstrap'
import { db } from "/db";
import AddAxis from "./AddAxis.vue"

export default {
    name: "LabelModal",
    components: {
        AddAxis,
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
        async onLabelCreated(label) {
            const currAnn = await db.lastSelected.where('id').equals(1).first();
            db.labels.add({name: label.name, color: label.color, annoId: currAnn.annoId});
            this.modal.hide();
        },
        labelEdited(label) {
            db.labels.update(label.id, {name: label.name, color: label.color});
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