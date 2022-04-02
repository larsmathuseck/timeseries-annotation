<template>
    <div class="modal fade" ref="labelModal" tabindex="-1" aria-hidden="false">
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Add Label</h5>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-0">
                    <AddLabel :key="addLabelKey" :labelToEdit="labelToEdit" @labelCreated="onLabelCreated" @labelEdited="labelEdited" @closeModal="closeModal" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import AddLabel from "./AddLabel.vue"
import { Modal } from 'bootstrap'
import { db } from "/db";

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
        closeModal() {
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