import type { SlideData } from "./slides";
import type { CourseFileNode } from "./courses";

/**
 * In-memory store for uploaded slide data and uploaded file nodes.
 * Data persists across client-side navigations but not full page reloads.
 */

type UploadData = {
  fileName: string;
  slides: SlideData[];
};

// Slide data store (keyed by upload ID)
const slideStore = new Map<string, UploadData>();

export function saveUpload(id: string, data: UploadData): void {
  slideStore.set(id, data);
}

export function getUpload(id: string): UploadData | undefined {
  return slideStore.get(id);
}

export function removeUpload(id: string): void {
  slideStore.delete(id);
}

// Uploaded file nodes per course (keyed by courseId → folderId → files)
type UploadedFile = CourseFileNode & { uploadId: string };
const uploadedFiles = new Map<string, UploadedFile[]>();

export function addUploadedFile(courseId: string, folderId: string, file: UploadedFile): void {
  const key = `${courseId}:${folderId}`;
  const existing = uploadedFiles.get(key) ?? [];
  existing.push(file);
  uploadedFiles.set(key, existing);
}

export function getUploadedFiles(courseId: string, folderId: string): UploadedFile[] {
  return uploadedFiles.get(`${courseId}:${folderId}`) ?? [];
}

export function getAllUploadedFiles(courseId: string): UploadedFile[] {
  const result: UploadedFile[] = [];
  for (const [key, files] of uploadedFiles.entries()) {
    if (key.startsWith(`${courseId}:`)) {
      result.push(...files);
    }
  }
  return result;
}
