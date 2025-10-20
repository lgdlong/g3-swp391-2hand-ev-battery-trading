import { ImageState, ImageAction } from '../types/types';

/**
 * Reducer for managing image upload state
 * @param state - Current state
 * @param action - Action to perform
 * @returns New state
 */
export const imageReducer = (state: ImageState, action: ImageAction): ImageState => {
  switch (action.type) {
    case 'SYNC_EXISTING':
      return {
        ...state,
        existing: action.payload,
        added: [],
        deletedIds: new Set(),
      };
    case 'ADD_IMAGES':
      return {
        ...state,
        added: [...state.added, ...action.payload],
        uploading: false,
      };
    case 'MARK_EXISTING_DELETED':
      return {
        ...state,
        deletedIds: new Set(state.deletedIds).add(action.payload),
      };
    case 'MARK_NEW_DELETED':
      return {
        ...state,
        added: state.added.map((img) =>
          img.tempId === action.payload ? { ...img, deleted: true } : img,
        ),
      };
    case 'SET_UPLOADING':
      return {
        ...state,
        uploading: action.payload,
      };
    case 'SET_DRAG_OVER':
      return {
        ...state,
        dragOver: action.payload,
      };
    default:
      return state;
  }
};
