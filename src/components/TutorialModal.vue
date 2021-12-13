<template>
    <div class="modal fade" ref="tutorialModal" tabindex="-1" aria-hidden="false">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">How to use TF-Annotator</h5>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="col-auto">
                        <vueper-slides fade :touchable="false" fixed-height="500px">
                            <vueper-slide v-for="(slide, i) in slides" :key="i" :title="slide.title" :image="slide.image" />
                        </vueper-slides>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary"  @click="closeModal">Close</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Modal } from 'bootstrap'
import { VueperSlides, VueperSlide } from 'vueperslides'
import 'vueperslides/dist/vueperslides.css'

export default {
    name: "TutorialModal",
    components: {
        VueperSlides, 
        VueperSlide        
    },
    props: {
        toggleModalVisibility: Boolean
    },
    data() {
        return {
            modal: null,
            slides: [
                {
                    image: require('../../public/img/tutorial/UploadDataScreenshotWithFolderStructure.png')
                },
                {
                    image: require('../../public/img/tutorial/ExampleChooseDataWithText.jpg')
                }
            ]
        }
    },
    methods: {
        closeModal: function() {
            this.modal.hide();
        },
    },
    watch: {
        toggleModalVisibility: function() {
            this.modal.show();
        },
    },
    mounted() {
        this.modal = new Modal(this.$refs.tutorialModal)
    },
}
</script>

<style scoped>
.modal-body {
    padding: 0px;
}


</style>

<style>
.vueperslides__arrow {
    color: grey
}
</style>