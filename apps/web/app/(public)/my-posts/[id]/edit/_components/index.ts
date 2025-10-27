// Main component export
export { default } from './ImageUpload';

// Re-export types and helpers for testing
export type { NewImage, DisplayImage, ImageState, ImageAction } from '../types/types';
export {
  validateFile,
  filterValidFiles,
  getActiveImageCount,
  createDisplayImages,
  buildImageDiff,
} from './helpers';
export { VALIDATION, MESSAGES, CSS_CLASSES } from '../constants/constants';
export { imageReducer } from './reducer';
