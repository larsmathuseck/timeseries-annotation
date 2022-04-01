<template>
    <div class="modal fade" ref="ImportModelModal" tabindex="-1" aria-hidden="false">
        <div class="modal-dialog modal-dialog-scrollable modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h4 class="modal-title">Feature Configuration</h4>
                    <label class="switch ms-2">
                        <input type="checkbox" v-model="showFeatureConfiguration" v-show="false">
                        <span class="slider round"></span>
                    </label>
                    <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ModelConfiguration v-show="!showFeatureConfiguration" :toggleConfigDownload="toggleModelConfigDownload" @setInvalidFeedback="setInvalidFeedback" @closeModal="closeModal"/>
                    <FeatureConfiguration v-show="showFeatureConfiguration" :toggleConfigDownload="toggleFeatureModelConfigDownload" @setInvalidFeedback="setInvalidFeedback" @closeModal="closeModal"/>
                    <div class="row justify-content-center" v-show="showInvalidFeedback.length > 0">
                        <div class="col-12">
                            <div class="alert alert-danger p-1 m-3" role="alert">
                                {{ showInvalidFeedback }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" @click="toggleDownloadConfig">Save Configuration</button>
                    <button class="btn btn-secondary" @click="closeModal">Close</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Modal } from 'bootstrap'
import ModelConfiguration from "./ModelConfiguration.vue";
import FeatureConfiguration from "./FeatureConfiguration.vue";

export default {
    name: "ImportModelModal",
    components: {
        ModelConfiguration,
        FeatureConfiguration,
    },
    data: function() {
        return {
            modal: null,
            showFeatureConfiguration: false,
            showInvalidFeedback: "",
            toggleModelConfigDownload: false,
            toggleFeatureModelConfigDownload: false,
        }
    },
    props: {
        toggleModelModalVisibility: Boolean,
    },
    methods: {
        setInvalidFeedback: function(invalidFeedback) {
            this.showInvalidFeedback = invalidFeedback;
        },
        toggleDownloadConfig: function() {
            if (this.showFeatureConfiguration) {
                this.toggleFeatureModelConfigDownload = !this.toggleFeatureModelConfigDownload;
            } else {
                this.toggleModelConfigDownload = !this.toggleModelConfigDownload;
            }
        },
        closeModal: function() {
            this.modal.hide();
        },
    },
    watch: {
        toggleModelModalVisibility: function() {
            this.showInvalidFeedback = "";
            this.modal.show();
        },
        showFeatureConfiguration: function() {
            this.showInvalidFeedback = "";
        }
    },
    computed: {
        axes: function() {
            return this.$store.getters.getAxes;
        },
    },
    mounted: function() {
        this.modal = new Modal(this.$refs.ImportModelModal);
    },
}
</script>

<style scoped>
.modal-body {
    overflow-y: auto;
}

.switch {
    width: 3rem;
    height: 1.5rem;
}

.slider:before {
    height: 1.15rem;
    width: 1.15rem;
    left: 0.25rem;
    bottom: 0.2rem;
}

input:checked + .slider:before {
    -webkit-transform: translateX(1.25rem);
    -ms-transform: translateX(1.25rem);
    transform: translateX(1.3rem);
}
</style>
