// Enrichment cache for PDF/slide analysis by Claude
// Stores the teaching scripts and key points so they don't need to be re-analyzed

import type { SlideData } from "./slides";

export type EnrichedSlide = SlideData & {
  teachingScript: string;
};

export type EnrichmentCache = {
  fileId: string;
  courseId: string;
  fileName: string;
  enrichedSlides: EnrichedSlide[];
  createdAt: string; // ISO date
  pageCount: number;
};

const ENRICHMENT_STORAGE_KEY = "slide-enrichments";

export function loadEnrichmentsFromStorage(): EnrichmentCache[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(ENRICHMENT_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveEnrichmentsToStorage(enrichments: EnrichmentCache[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ENRICHMENT_STORAGE_KEY, JSON.stringify(enrichments));
  } catch (err) {
    console.error("Failed to save enrichments to localStorage:", err);
  }
}

/**
 * Get cached enrichment for a specific file
 */
export function getEnrichmentForFile(fileId: string, courseId: string): EnrichmentCache | null {
  const enrichments = loadEnrichmentsFromStorage();
  return enrichments.find((e) => e.fileId === fileId && e.courseId === courseId) || null;
}

/**
 * Save enrichment data for a file
 */
export function saveEnrichmentForFile(
  fileId: string,
  courseId: string,
  fileName: string,
  enrichedSlides: EnrichedSlide[]
): EnrichmentCache {
  const enrichments = loadEnrichmentsFromStorage();
  
  // Remove any existing enrichment for this file
  const filtered = enrichments.filter(
    (e) => !(e.fileId === fileId && e.courseId === courseId)
  );
  
  const newEnrichment: EnrichmentCache = {
    fileId,
    courseId,
    fileName,
    enrichedSlides,
    createdAt: new Date().toISOString(),
    pageCount: enrichedSlides.length,
  };
  
  const updated = [...filtered, newEnrichment];
  saveEnrichmentsToStorage(updated);
  
  return newEnrichment;
}

/**
 * Delete enrichment for a specific file
 */
export function deleteEnrichmentForFile(fileId: string, courseId: string): boolean {
  const enrichments = loadEnrichmentsFromStorage();
  const filtered = enrichments.filter(
    (e) => !(e.fileId === fileId && e.courseId === courseId)
  );
  
  if (filtered.length === enrichments.length) return false;
  
  saveEnrichmentsToStorage(filtered);
  return true;
}

/**
 * Clear all enrichment cache
 */
export function clearAllEnrichments() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ENRICHMENT_STORAGE_KEY);
}
