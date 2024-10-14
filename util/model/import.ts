import * as tf from '@tensorflow/tfjs'

export const checkImportedFiles = (
    e: Event,
    callback: (model: tf.LayersModel, modelFileName: any, config: any) => void,
) => {
    if (!e.target || !(e.target instanceof HTMLInputElement)) return

    const fileList = e.target.files

    if (!fileList) return

    let model
    let config
    const weights = []
    for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
        const file = fileList[i]
        if (
            file.name[0] !== '.' &&
            file.type.toLowerCase().includes('json') &&
            file.name.toLowerCase().includes('model')
        ) {
            model = file
        } else if (
            (file.name.toLowerCase().includes('configuration') ||
                file.name.toLowerCase().includes('config')) &&
            file.type.toLowerCase().includes('json')
        ) {
            config = file
        } else if (file.name[0] !== '.') {
            weights.push(file)
        }
    }
    if (model) {
        importModel(model, weights, config, callback)
    } else {
        return new Error('Could not read any model file!')
    }
}

export function importModel(
    modelFile: File,
    weights: File[],
    config: File | undefined,
    callback: (model: any, modelFileName: any, config: any) => void,
) {
    // tf.serialization.registerClass(L1L2Regularizer);
    const reader = new FileReader()
    reader.readAsText(modelFile)
    reader.onload = async () => {
        if (!reader.result) return

        const model = JSON.parse(reader.result.toString()) as {
            modelTopology?: {
                // eslint-disable-next-line camelcase
                model_config?: {
                    config: {
                        // eslint-disable-next-line camelcase
                        layers: { config: { activity_regularizer: unknown } }[]
                    }
                }
            }
        }
        const layers = model?.modelTopology?.model_config?.config.layers

        if (layers) {
            layers.forEach((layer) => {
                delete layer.config.activity_regularizer
            })
        }
        const modelArray = [new File([JSON.stringify(model)], 'model.json')]
        weights.forEach((weight) => {
            modelArray.push(weight)
        })
        await tf
            // eslint-disable-next-line import/namespace
            .loadLayersModel(tf.io.browserFiles(modelArray))
            .then((model) => callback(model, modelFile.name, config))
    }
}

// class L1L2Regularizer extends tf.serialization.Serializable {
//     private config: { l1?: number; l2?: number }
//     constructor(config: { l1?: number; l2?: number } = {}) {
//         super()
//         return tf.regularizers.l1l2(config);
//     }

//     // // Method to apply the regularizer
//     // apply(x: tf.Tensor): tf.Scalar {
//     //     const l1 = this.config.l1 ?? 0.01;
//     //     const l2 = this.config.l2 ?? 0.01;

//     //     return tf.tidy(() => {
//     //         const l1Term = l1 > 0 ? tf.sum(tf.mul(l1, tf.abs(x))) : tf.scalar(0);
//     //         const l2Term = l2 > 0 ? tf.sum(tf.mul(l2, tf.square(x))) : tf.scalar(0);
//     //         return tf.add(l1Term, l2Term);
//     //     });
//     // }

//     // Static method to get the class name for serialization
//     static get className() {
//         return 'L1L2Regularizer';
//     }

//     // Method to get the class name for serialization
//     // getClassName() {
//     //     return L1L2Regularizer.className;
//     // }

//     // Method to get the config for serialization
//     getConfig() {
//         super.
//         return this.config;
//     }

//     // Static method to create an instance from a config
//     // static fromConfig(cls: typeof L1L2Regularizer, config: { l1?: number; l2?: number }): L1L2Regularizer {
//     //     return new cls(config);
//     // }
// }
