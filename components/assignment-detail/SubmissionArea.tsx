"use client";

import { useRef, useState } from "react";
import {
  CheckCircle as CheckCircleIcon,
  File as FileIcon,
  UploadSimple as UploadSimpleIcon,
  X as XIcon,
} from "@phosphor-icons/react/dist/ssr";
import { CourseAssignment } from "@/lib/courses";

type Props = {
  assignment: CourseAssignment;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SubmissionArea({ assignment }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  if (assignment.status === "submitted") {
    return (
      <div className="bg-surface border border-ink-border rounded-2xl p-6">
        <div className="flex items-center gap-2">
          <CheckCircleIcon size={20} weight="fill" className="text-emerald-500" />
          <h2 className="text-[15px] font-semibold">Assignment Submitted</h2>
        </div>
        <p className="text-[13px] text-ink-muted mt-1">{assignment.dueDate}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-ink-border rounded-2xl p-6">
      <h2 className="text-[15px] font-semibold mb-4">Submit Assignment</h2>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragOver
            ? "border-[var(--brand)] bg-[var(--brand-tint)]"
            : "border-ink-border hover:border-[var(--brand)] hover:bg-[var(--brand-tint)]/30"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const dropped = Array.from(e.dataTransfer.files);
          setFiles((prev) => [...prev, ...dropped]);
        }}
      >
        <UploadSimpleIcon size={24} className="text-ink-muted mb-2 mx-auto" />
        <p className="text-[14px] font-medium text-ink-muted">
          Drag files here or click to browse
        </p>
        <p className="text-[12px] text-ink-subtle mt-1">
          PDF, ZIP, DOCX up to 50 MB
        </p>
        <input
          type="file"
          multiple
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center gap-3 px-3 py-2.5 bg-surface-muted rounded-xl"
            >
              <FileIcon size={16} className="text-ink-muted" />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate">{file.name}</div>
                <div className="text-[11.5px] text-ink-muted">
                  {formatFileSize(file.size)}
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="w-6 h-6 grid place-items-center rounded-md text-ink-subtle hover:text-rose-500 hover:bg-rose-50 transition-colors"
              >
                <XIcon size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Submit button */}
      <button
        disabled={files.length === 0}
        className="mt-4 w-full bg-ink text-white text-[13px] font-medium py-2.5 rounded-full hover:bg-ink/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Submit Assignment
      </button>
    </div>
  );
}
