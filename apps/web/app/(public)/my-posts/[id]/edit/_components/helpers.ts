import { toast } from 'sonner';
import { ImageDiffPayload, PostImage } from '@/types/post';
import { NewImage, DisplayImage } from '../types/types';
import { VALIDATION, MESSAGES } from '../constants/constants';

/**
 * Validates a file for image upload
 * @param file - File to validate
 * @returns Error message if invalid, null if valid
 */
export const validateFile = (file: File): string | null => {
  if (!file.type.startsWith('image/')) {
    return MESSAGES.INVALID_FILE_TYPE(file.name);
  }
  if (file.size > VALIDATION.MAX_FILE_SIZE) {
    return MESSAGES.FILE_TOO_LARGE(file.name);
  }
  return null;
};

/**
 * Filters valid files from FileList and shows toast errors for invalid ones
 * @param files - FileList to filter
 * @returns Array of valid files
 */
export const filterValidFiles = (files: FileList): File[] => {
  const validFiles: File[] = [];
  Array.from(files).forEach((file) => {
    const error = validateFile(file);
    if (error) {
      toast.error(error);
    } else {
      validFiles.push(file);
    }
  });
  return validFiles;
};

/**
 * Gets the count of active (non-deleted) images
 * @param existing - Existing images
 * @param added - Added images
 * @param deletedIds - Set of deleted image IDs
 * @returns Number of active images
 */
export const getActiveImageCount = (
  existing: PostImage[],
  added: NewImage[],
  deletedIds: Set<string>,
): number => {
  const activeExisting = existing.filter(
    (img) => !deletedIds.has(img.id) && !deletedIds.has(img.publicId),
  ).length;
  const activeAdded = added.filter((img) => !img.deleted).length;
  return activeExisting + activeAdded;
};

/**
 * Creates display images array from current state
 * @param existing - Existing images
 * @param added - Added images
 * @param deletedIds - Set of deleted image IDs
 * @returns Sorted array of display images
 */
export const createDisplayImages = (
  existing: PostImage[],
  added: NewImage[],
  deletedIds: Set<string>,
): DisplayImage[] => {
  const keptExisting = existing
    .filter((img) => !deletedIds.has(img.id) && !deletedIds.has(img.publicId))
    .map(
      (img): DisplayImage => ({
        kind: 'existing',
        id: img.id,
        publicId: img.publicId,
        url: img.url,
        position: img.position,
      }),
    );

  const keptAdded = added
    .filter((img) => !img.deleted)
    .map(
      (img): DisplayImage => ({
        kind: 'new',
        tempId: img.tempId,
        url: img.previewUrl,
        position: img.position,
      }),
    );

  return [...keptExisting, ...keptAdded].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
};

/**
 * Builds image diff payload for parent component
 * @param existing - Existing images
 * @param added - Added images
 * @param deletedIds - Set of deleted image IDs
 * @returns Image diff payload
 */
export const buildImageDiff = (
  existing: PostImage[],
  added: NewImage[],
  deletedIds: Set<string>,
): ImageDiffPayload => {
  const toDelete = Array.from(deletedIds);

  const toKeep = existing
    .filter((img) => !deletedIds.has(img.id) && !deletedIds.has(img.publicId))
    .map((img) => ({
      id: img.id,
      publicId: img.publicId,
      position: img.position ?? 0,
    }));

  const toUpload = added
    .filter((img) => !img.deleted)
    .map((img) => ({
      file: img.file,
      position: img.position ?? 0,
    }));

  const mainFromKeep = toKeep.find((img) => img.position === 0);
  const hasMain = !!mainFromKeep || toUpload.some((img) => img.position === 0);

  return { toDelete, toKeep, toUpload, hasMain };
};
