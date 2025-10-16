import { PostImage } from '@/types/post';

// Internal type for new images (only used in this component)
export interface NewImage {
  tempId: string;
  file: File;
  previewUrl: string;
  position: number;
  deleted?: boolean;
}

// Display image representation for the UI
export interface DisplayImage {
  kind: 'existing' | 'new';
  id?: string;
  publicId?: string;
  tempId?: string;
  url: string;
  position: number;
}

// Component state interface
export interface ImageState {
  existing: PostImage[];
  added: NewImage[];
  deletedIds: Set<string>;
  uploading: boolean;
  dragOver: boolean;
}

// Reducer action types
export type ImageAction =
  | { type: 'SYNC_EXISTING'; payload: PostImage[] }
  | { type: 'ADD_IMAGES'; payload: NewImage[] }
  | { type: 'MARK_EXISTING_DELETED'; payload: string }
  | { type: 'MARK_NEW_DELETED'; payload: string }
  | { type: 'SET_UPLOADING'; payload: boolean }
  | { type: 'SET_DRAG_OVER'; payload: boolean };
