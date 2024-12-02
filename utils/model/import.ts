import type { LayersModel } from '@tensorflow/tfjs'
import tf from '@tensorflow/tfjs'

export const checkImportedFiles = (
    event: Event,
    callback: (
        model: LayersModel,
        modelFileName: string,
        config: File | undefined,
    ) => void,
) => {
    const input = event.target as HTMLInputElement

    if (!input || !input.files) return

    const files = input.files
    let modelFile: File | null = null
    let configFile: File | undefined
    const weightFiles: File[] = []

    for (const file of files) {
        const fileName = file.name.toLowerCase()
        const fileType = file.type.toLowerCase()

        if (fileName.startsWith('.')) continue // Skip hidden files

        if (fileType.includes('json') && fileName.includes('model')) {
            modelFile = file
        } else if (
            fileType.includes('json') &&
            (fileName.includes('config') || fileName.includes('configuration'))
        ) {
            configFile = file
        } else {
            weightFiles.push(file)
        }
    }

    if (modelFile) {
        importModel(modelFile, weightFiles, configFile, callback)
    } else {
        alert('Could not read any model file!') // TODO: show beautiful modal
    }
}

export const importModel = (
    modelFile: File,
    weightFiles: File[],
    configFile: File | undefined,
    callback: (
        model: LayersModel,
        modelFileName: string,
        configFile: File | undefined,
    ) => void,
) => {
    // tf.serialization.registerClass(L1L2Regularizer);
    const reader = new FileReader()

    reader.onload = async () => {
        try {
            if (!reader.result) throw new Error('Error reading the model file.')

            const modelJson = JSON.parse(reader.result.toString())

            const layers =
                modelJson?.modelTopology?.model_config?.config?.layers

            if (layers) {
                layers.forEach(
                    (layer: { config: { activity_regularizer: unknown } }) => {
                        delete layer.config.activity_regularizer
                    },
                )
            }

            const modelFiles: File[] = [
                new File([JSON.stringify(modelJson)], 'model.json'),
                ...weightFiles,
            ]

            const loadedModel = await tf.loadLayersModel(
                tf.io.browserFiles(modelFiles),
            )

            callback(loadedModel, modelFile.name, configFile)
        } catch (error) {
            notifyError({ message: 'Error importing model:' }, error)
        }
    }

    reader.onerror = () => {
        notifyError({ message: 'Failed to read the model file.' })
    }

    reader.readAsText(modelFile)
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
