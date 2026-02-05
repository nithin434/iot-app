/**
 * Media API Service
 * Handles video and image upload/download
 */

import { apiClient } from './client';
import * as DocumentPicker from 'expo-document-picker';

export interface MediaUploadResponse {
  mediaId: string;
  filename: string;
  mediaType: string;
  url: string;
  createdAt: string;
}

export interface MediaInfo {
  mediaId: string;
  filename: string;
  mediaType: string;
  title?: string;
  description?: string;
  fileSize: number;
  uploadDate: string;
  url: string;
}

export const mediaService = {
  /**
   * Upload video or image
   */
  uploadMedia: async (
    file: DocumentPicker.DocumentPickerResult,
    mediaType: 'video' | 'image',
    title?: string,
    description?: string,
    tutorialId?: string
  ): Promise<MediaUploadResponse> => {
    if (file.canceled || !file.assets || file.assets.length === 0) {
      throw new Error('No file selected');
    }

    const asset = file.assets[0];
    const formData = new FormData();

    formData.append('file', {
      uri: asset.uri,
      type: asset.mimeType || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
      name: asset.name,
    } as any);

    formData.append('mediaType', mediaType);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    if (tutorialId) formData.append('tutorialId', tutorialId);

    return apiClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get media info
   */
  getMediaInfo: async (mediaId: string): Promise<MediaInfo> => {
    return apiClient.get(`/media/${mediaId}`);
  },

  /**
   * Get media for tutorial
   */
  getTutorialMedia: async (tutorialId: string): Promise<{ tutorialId: string; media: MediaInfo[] }> => {
    return apiClient.get(`/media/tutorial/${tutorialId}`);
  },

  /**
   * Download media
   */
  downloadMedia: async (mediaId: string): Promise<string> => {
    return apiClient.get(`/media/${mediaId}/download`);
  },

  /**
   * Delete media
   */
  deleteMedia: async (mediaId: string): Promise<{ message: string }> => {
    return apiClient.delete(`/media/${mediaId}`);
  },

  /**
   * Pick video from device
   */
  pickVideo: async (): Promise<DocumentPicker.DocumentPickerResult> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: false,
      });
      return result;
    } catch (error) {
      throw new Error('Failed to pick video: ' + error);
    }
  },

  /**
   * Pick image from device
   */
  pickImage: async (): Promise<DocumentPicker.DocumentPickerResult> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: false,
      });
      return result;
    } catch (error) {
      throw new Error('Failed to pick image: ' + error);
    }
  },
};
