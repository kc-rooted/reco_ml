"use strict";
// Shared constants for model paths and configurations
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODELS_DIR = exports.LATEST_MODEL_PATH = void 0;
exports.getModelPath = getModelPath;
exports.getLatestModelPath = getLatestModelPath;
exports.LATEST_MODEL_PATH = 'file://./models/latest/model.json';
exports.MODELS_DIR = './models';
// Model versioning helpers
function getModelPath(version) {
    return `file://./models/${version}/model.json`;
}
function getLatestModelPath() {
    return exports.LATEST_MODEL_PATH;
}
//# sourceMappingURL=constants.js.map