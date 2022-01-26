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
                    image: require('../../public/img/tutorial/ImportData.jpg')
                },
                {
                    image: require('../../public/img/tutorial/ExampleChooseDataWithText.jpg')
                }, 
                {
                    image: require('../../public/img/tutorial/ExampleChooseAnnotation.jpg')
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

.vueperslides__bullet .default {
  background-color: rgb(218, 218, 218);
  border: none;
  box-shadow: none;
  transition: 0.3s;
}

.vueperslides__bullet--active .default {
    background-color: grey;
}

</style>