"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderIcon,
  FolderOpenIcon,
  FileIcon,
  FilePdfIcon,
  FileTextIcon,
  FilePptIcon,
  FileArchiveIcon,
  FileCodeIcon,
  CaretRightIcon,
  SparkleIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { CourseFileNode } from "@/lib/courses";
import { isEligibleForReview } from "@/lib/slides";
import PracticeModal from "@/components/PracticeModal";

function getFileIcon(name: string): React.ReactNode {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return <FilePdfIcon size={15} />;
  if (["docx", "doc", "txt", "md"].includes(ext))
    return <FileTextIcon size={15} />;
  if (["pptx", "ppt"].includes(ext)) return <FilePptIcon size={15} />;
  if (["zip", "tar", "gz", "rar"].includes(ext))
    return <FileArchiveIcon size={15} />;
  if (["js", "ts", "tsx", "jsx", "py", "c", "cpp", "java", "rs"].includes(ext))
    return <FileCodeIcon size={15} />;
  return <FileIcon size={15} />;
}

type FileNodeProps = {
  node: CourseFileNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  courseId: string;
  /** Optional course name for richer AI context */
  courseName?: string;
};

export default function FileNode({
  node,
  depth,
  expanded,
  onToggle,
  courseId,
  courseName,
}: FileNodeProps) {
  const isExpanded = expanded.has(node.id);
  const isFolder = node.type === "folder";
  const isUploadedFile = node.id.startsWith("upload-");
  const router = useRouter();
  const [showPractice, setShowPractice] = useState(false);

  // Build a context string for the AI from what we know about the file
  const practiceContext = [
    courseName ? `Course: ${courseName}` : "",
    `File: ${node.name}`,
    node.modifiedAt ? `Last updated: ${node.modifiedAt}` : "",
    node.size ? `Size: ${node.size}` : "",
    `\nThis is a course file. Generate study material based on the file name and course context. Infer the likely content from the file name.`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <>
      <li>
        <div
          className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-[var(--brand-tint)]/60 transition-colors cursor-pointer select-none"
          style={{ paddingLeft: `${16 + depth * 16}px` }}
          onClick={() => {
            if (isFolder) {
              onToggle(node.id);
            } else if (isUploadedFile) {
              router.push(`/courses/${courseId}/review/${node.id}`);
            } else if (node.url) {
              window.open(node.url, "_blank");
            }
          }}
          role={isFolder ? "button" : "link"}
          aria-expanded={isFolder ? isExpanded : undefined}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (isFolder) {
                onToggle(node.id);
              } else if (isUploadedFile) {
                router.push(`/courses/${courseId}/review/${node.id}`);
              } else if (node.url) {
                window.open(node.url, "_blank");
              }
            }
          }}
        >
          {/* Folder caret */}
          {isFolder && (
            <span
              className={`text-ink-subtle transition-transform duration-150 ${
                isExpanded ? "rotate-90" : ""
              }`}
            >
              <CaretRightIcon size={12} weight="bold" />
            </span>
          )}

          {/* Icon */}
          <span className="text-ink-subtle shrink-0">
            {isFolder ? (
              isExpanded ? (
                <FolderOpenIcon size={15} weight="fill" />
              ) : (
                <FolderIcon size={15} weight="fill" />
              )
            ) : (
              getFileIcon(node.name)
            )}
          </span>

          {/* Name */}
          <span className="flex-1 min-w-0 text-[13.5px] font-medium truncate">
            {node.name}
          </span>

          {/* File metadata */}
          {!isFolder && (node.size || node.modifiedAt) && (
            <span className="text-[11.5px] text-ink-muted shrink-0 hidden sm:block">
              {[node.size, node.modifiedAt].filter(Boolean).join(" · ")}
            </span>
          )}

          {/* AI Review button for uploaded/eligible files */}
          {!isFolder && isEligibleForReview(node.name) && (
            <Link
              href={`/courses/${courseId}/review/${node.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--brand-tint)] text-[var(--brand)] hover:bg-[var(--brand-tint-strong)] transition-colors inline-flex items-center gap-1 shrink-0"
            >
              <SparkleIcon size={10} weight="fill" />
              AI Review
            </Link>
          )}

          {/* Practice with Sparky button — all non-folder files */}
          {!isFolder && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPractice(true);
              }}
              className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-ink text-white hover:bg-ink/80 transition-colors inline-flex items-center gap-1 shrink-0"
            >
              <SparkleIcon size={10} weight="fill" />
              Practice
            </button>
          )}
        </div>

        {/* Children */}
        {isFolder && isExpanded && node.children && node.children.length > 0 && (
          <ul>
            {node.children.map((child) => (
              <FileNode
                key={child.id}
                node={child}
                depth={depth + 1}
                expanded={expanded}
                onToggle={onToggle}
                courseId={courseId}
                courseName={courseName}
              />
            ))}
          </ul>
        )}
      </li>

      {/* Practice Modal */}
      {showPractice && (
        <PracticeModal
          title={node.name}
          context={practiceContext}
          onClose={() => setShowPractice(false)}
        />
      )}
    </>
  );
}
