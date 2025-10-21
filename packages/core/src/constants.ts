// Shared constants for model paths and configurations

export const LATEST_MODEL_PATH = 'file://./models/latest/model.json';
export const MODELS_DIR = './models';

// Model versioning helpers
export function getModelPath(version: string): string {
  return `file://./models/${version}/model.json`;
}

export function getLatestModelPath(): string {
  return LATEST_MODEL_PATH;
}
