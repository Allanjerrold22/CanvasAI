import type { SlideData } from "./slides";
import type { CourseFileNode } from "./courses";

/**
 * Persistent store for uploaded slide data and uploaded file nodes.
 * Uses localStorage so data survives page reloads.
 */

type UploadData = {
  fileName: string;
  slides: SlideData[];
  pdfFile?: string; // public URL for PDF files
};

// ── Slide/upload data persistence ──

const UPLOADS_STORAGE_KEY = "uploaded-slides";

export function saveUpload(id: string, data: UploadData): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadAllUploads();
    all[id] = data;
    localStorage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(all));
  } catch (err) {
    console.error("Failed to save upload:", err);
  }
}

export function getUpload(id: string): UploadData | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const all = loadAllUploads();
    return all[id] ?? undefined;
  } catch {
    return undefined;
  }
}

export function removeUpload(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadAllUploads();
    delete all[id];
    localStorage.setItem(UPLOADS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

function loadAllUploads(): Record<string, UploadData> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(UPLOADS_STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

// ── Uploaded file nodes persistence ──

const FILE_NODES_STORAGE_KEY = "uploaded-file-nodes";

type UploadedFile = CourseFileNode & { uploadId: string };

function loadAllFileNodes(): Record<string, UploadedFile[]> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(FILE_NODES_STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

function saveAllFileNodes(data: Record<string, UploadedFile[]>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FILE_NODES_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save file nodes:", err);
  }
}

export function addUploadedFile(courseId: string, folderId: string, file: UploadedFile): void {
  const all = loadAllFileNodes();
  const key = `${courseId}:${folderId}`;
  const existing = all[key] ?? [];
  existing.push(file);
  all[key] = existing;
  saveAllFileNodes(all);
}

export function getUploadedFiles(courseId: string, folderId: string): UploadedFile[] {
  const all = loadAllFileNodes();
  return all[`${courseId}:${folderId}`] ?? [];
}

export function getAllUploadedFiles(courseId: string): UploadedFile[] {
  const all = loadAllFileNodes();
  const result: UploadedFile[] = [];
  for (const [key, files] of Object.entries(all)) {
    if (key.startsWith(`${courseId}:`)) {
      result.push(...files);
    }
  }
  return result;
}
