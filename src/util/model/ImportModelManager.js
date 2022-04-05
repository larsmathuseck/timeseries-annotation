import * as tf from '@tensorflow/tfjs';

export function checkImportedFiles(e, callback) {
    const fileList = e.target.files;
    let model;
    let config = null;
    const weights = [];
    for (let i = 0, numFiles = fileList.length; i < numFiles; i++) {
        const file = fileList[i];
        if(file.name[0] != '.' && (file.type.toLowerCase().includes("json") && file.name.toLowerCase().includes("model"))) {
            model = file;
        }
        else if ((file.name.toLowerCase().includes("configuration") || file.name.toLowerCase().includes("config")) && file.type.toLowerCase().includes("json")) {
            config = file;
        }
        else if(file.name[0] != '.') {
            weights.push(file);
        }
    }
    if (model) {
        importModel(model, weights, config, callback);
    } else {
        return (new Error("Could not read any model file!"));
    }
}

export async function importModel(modelFile, weights, config, callback) {
    tf.serialization.registerClass(L2);
    const reader = new FileReader();
    reader.readAsText(modelFile);
    reader.onload = async () => {
        const model = JSON.parse(reader.result);
        const layers = model?.modelTopology?.model_config?.config.layers;
        if(layers != null) {
            layers.forEach(layer => {
                let config = layer.config;
                delete config.activity_regularizer;
            });
        }
        let modelArray = [new File([JSON.stringify(model)], "model.json")];
        weights.forEach(weight => {
            modelArray.push(weight);
        });
        await tf.loadLayersModel(tf.io.browserFiles(modelArray)).then((model) => callback(model, modelFile.name, config));
    };
}

class L2 {
    static className = 'L2';

    constructor(config) {
        return tf.regularizers.l1l2(config);
    }
}