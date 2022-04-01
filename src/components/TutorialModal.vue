<template>
    <div class="modal fade" ref="tutorialModal" tabindex="-1" aria-hidden="false">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">How to use TF-Annotator</h5>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="carouselExampleDark" ref="exampleCarousel" class="carousel carousel-dark slide" data-bs-interval="false" data-bs-ride="carousel">
                        <div class="carousel-indicators">
                            <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
                            <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="1" aria-label="Slide 2"></button>
                            <button type="button" data-bs-target="#carouselExampleDark" data-bs-slide-to="2" aria-label="Slide 3"></button>
                        </div>
                        <div class="carousel-inner">
                            <div class="carousel-item active" data-bs-interval="10000">
                                <img src="img/tutorial/ImportData.jpg" class="d-block w-100">
                            </div>
                            <div class="carousel-item" data-bs-interval="2000">
                                <img src="img/tutorial/ExampleChooseDataWithText.jpg" class="d-block w-100">
                            </div>
                            <div class="carousel-item">
                                <img src="img/tutorial/ExampleChooseAnnotation.jpg" class="d-block w-100">
                            </div>
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleDark" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleDark" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
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
import { Modal, Carousel } from 'bootstrap'

export default {
    name: "TutorialModal",
    props: {
        toggleTutorialModalVisibility: Boolean
    },
    data: function() {
        return {
            modal: null,
            carousel: null,
        }
    },
    methods: {
        closeModal: function() {
            this.modal.hide();
        },
    },
    watch: {
        toggleTutorialModalVisibility: function() {
            this.modal.show();
        },
    },
    mounted: function() {
        this.modal = new Modal(this.$refs.tutorialModal);
        this.carousel = new Carousel(this.$refs.exampleCarousel);
    },
}
</script>