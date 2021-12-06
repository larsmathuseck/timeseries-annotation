<template>
    <div class="modal fade" ref="exampleModal" tabindex="-1" aria-hidden="false" @focusout="test">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                    <button type="button" class="btn-close" @click="modal.hide()" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                krass
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="modal.hide()">Close</button>
                    <button type="button" class="btn btn-primary">Save changes</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Modal } from 'bootstrap'

export default {
    name: "LabelModal",
    props: {
        modalVisible: Boolean,
    },
    data() {
        return {
            modal: null,
        }
    },
    methods: {
        test: function() {
            console.log("hier")
        }
    },
    watch: {
        modalVisible: function() {
            this.modal.show();
        }
    },

    mounted() {
        this.modal = new Modal(this.$refs.exampleModal)
    },
}
</script>