"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UploadSimple as UploadSimpleIcon,
  CircleNotch as SpinnerIcon,
  Folder as FolderIcon,
  X as XIcon,
  CheckCircle as CheckCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  saveUpload,
  addUploadedFile,
  getAllUploadedFiles,
} from "@/lib/upload-store";
import type { CourseFileNode } from "@/lib/courses";
import type { SlideData } from "@/lib/slides";
import FileNode from "./FileNode";

export default function FilesPanel({
  files,
  courseId,
}: {
  files: CourseFileNode[] | undefined;
  courseId: string;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{
    fileName: string;
    slides: SlideData[];
    uploadId: string;
    label: string;
  } | null>(null);
  const [uploadedFileNodes, setUploadedFileNodes] = useState<CourseFileNode[]>([]);

  // Load uploaded files from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setUploadedFileNodes(getAllUploadedFiles(courseId));
  }, [courseId]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleToggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Get all folders from the file tree
  function getFolders(nodes: CourseFileNode[]): CourseFileNode[] {
    const folders: CourseFileNode[] = [];
    for (const node of nodes) {
      if (node.type === "folder") {
        folders.push(node);
        if (node.children) {
          folders.push(...getFolders(node.children));
        }
      }
    }
    return folders;
  }

  const folders = files ? getFolders(files) : [];

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const isPdf = file.name.toLowerCase().endsWith(".pdf");

      // Step 1: Save the file to public/uploads/ for persistent access
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadRes = await fetch("/api/upload-file", {
        method: "POST",
        body: uploadFormData,
      });

      let savedFileUrl: string | undefined;
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        savedFileUrl = uploadData.url;
        console.log("[FilesPanel] File saved to:", savedFileUrl);
      } else {
        console.warn("[FilesPanel] Could not save file to public, continuing with in-memory only");
      }

      // Step 2: Parse the file for slide data
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-pptx", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await res.json();
      const uploadId = `upload-${Date.now()}`;

      // Save with the public file URL so it persists across reloads
      saveUpload(uploadId, {
        fileName: data.fileName,
        slides: data.slides,
        pdfFile: isPdf ? savedFileUrl : undefined,
      });

      // Show folder picker
      const isPdfFile = data.fileName.toLowerCase().endsWith(".pdf");
      setPendingUpload({
        fileName: data.fileName,
        slides: data.slides,
        uploadId,
        label: isPdfFile ? `${data.slides.length} pages` : `${data.slides.length} slides`,
      });
      setShowFolderPicker(true);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleFolderSelect(folderId: string) {
    if (!pendingUpload) return;

    const fileNode: CourseFileNode & { uploadId: string } = {
      id: pendingUpload.uploadId,
      name: pendingUpload.fileName,
      type: "file",
      size: pendingUpload.label,
      modifiedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      uploadId: pendingUpload.uploadId,
    };

    addUploadedFile(courseId, folderId, fileNode);
    setUploadedFileNodes(getAllUploadedFiles(courseId));
    setShowFolderPicker(false);
    setPendingUpload(null);

    // Expand the target folder so the user sees the file
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(folderId);
      return next;
    });
  }

  function handleSaveToRoot() {
    if (!pendingUpload) return;

    const fileNode: CourseFileNode & { uploadId: string } = {
      id: pendingUpload.uploadId,
      name: pendingUpload.fileName,
      type: "file",
      size: pendingUpload.label,
      modifiedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      uploadId: pendingUpload.uploadId,
    };

    addUploadedFile(courseId, "__root__", fileNode);
    setUploadedFileNodes(getAllUploadedFiles(courseId));
    setShowFolderPicker(false);
    setPendingUpload(null);
  }

  // Merge uploaded files into the file tree for display
  const allFiles = [
    ...(files ?? []),
    ...uploadedFileNodes.filter(
      (uf) => !files?.some((f) => f.id === uf.id)
    ),
  ];

  return (
    <div>
      {/* Upload button */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 bg-[var(--brand)] text-white text-[13px] font-medium px-4 py-2 rounded-full hover:bg-[var(--brand)]/90 transition-colors disabled:opacity-50"
        >
          {isUploading ? (
            <SpinnerIcon size={14} weight="bold" className="animate-spin" />
          ) : (
            <UploadSimpleIcon size={14} weight="bold" />
          )}
          {isUploading ? "Parsing…" : "Upload PPT / PDF for AI Review"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pptx,.ppt,.pdf"
          onChange={handleUpload}
          className="hidden"
        />
        {uploadError && (
          <span className="text-[12px] text-rose-600">{uploadError}</span>
        )}
      </div>

      {/* File tree */}
      <div className="bg-surface border border-ink-border rounded-2xl overflow-hidden">
        {allFiles.length === 0 ? (
          <div className="py-16 text-center text-ink-muted text-sm">
            No files have been uploaded for this course yet.
          </div>
        ) : (
          <ul className="divide-y divide-ink-border py-1">
            {allFiles.map((node) => (
              <FileNode
                key={node.id}
                node={node}
                depth={0}
                expanded={expanded}
                onToggle={handleToggle}
                courseId={courseId}
              />
            ))}
          </ul>
        )}
      </div>

      {/* ── Folder picker modal ── */}
      {showFolderPicker && pendingUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-ink-border/30 w-full max-w-sm mx-4 overflow-hidden animate-slideUp">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-border/30">
              <div>
                <h3 className="text-[15px] font-semibold">Save to folder</h3>
                <p className="text-[12px] text-ink-muted mt-0.5">
                  {pendingUpload.fileName}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowFolderPicker(false);
                  setPendingUpload(null);
                }}
                className="w-7 h-7 grid place-items-center rounded-full hover:bg-surface-muted text-ink-muted"
              >
                <XIcon size={14} />
              </button>
            </div>

            {/* Folder list */}
            <div className="px-3 py-3 max-h-[280px] overflow-y-auto">
              {/* Root option */}
              <button
                onClick={handleSaveToRoot}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--brand-tint)] transition-colors text-left"
              >
                <FolderIcon size={18} weight="fill" className="text-ink-muted shrink-0" />
                <span className="text-[13px] font-medium">Root (no folder)</span>
              </button>

              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleFolderSelect(folder.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--brand-tint)] transition-colors text-left"
                >
                  <FolderIcon
                    size={18}
                    weight="fill"
                    className="text-ink-muted shrink-0"
                  />
                  <span className="text-[13px] font-medium truncate">
                    {folder.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-ink-border/20 bg-surface-muted/50">
              <p className="text-[11px] text-ink-subtle text-center">
                The file will appear in the selected folder with an AI Review button
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
