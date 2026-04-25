"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import type { SlideData } from "@/lib/slides";
import { getUpload } from "@/lib/upload-store";
import SlideReviewerClient from "./SlideReviewerClient";

type Props = {
  courseId: string;
  courseName: string;
  uploadId: string;
};

export default function UploadedSlideReviewer({
  courseId,
  courseName,
  uploadId,
}: Props) {
  const [data, setData] = useState<{
    fileName: string;
    slides: SlideData[];
    pdfFile?: string;
  } | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = getUpload(uploadId);
    if (stored) {
      setData({
        fileName: stored.fileName,
        slides: stored.slides,
        pdfFile: stored.pdfFile,
      });
    } else {
      setNotFound(true);
    }
  }, [uploadId]);

  if (notFound) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
        <p className="text-[18px] font-semibold">Upload not found</p>
        <p className="text-ink-muted text-[14px]">
          The uploaded file data has expired. Please upload again.
        </p>
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--brand)] hover:underline"
        >
          <ArrowLeftIcon size={14} />
          Back to {courseName}
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-[14px] text-ink-muted animate-pulse">
          Loading slides…
        </div>
      </div>
    );
  }

  // Check if this is a PDF file
  const isPDF = data.fileName.toLowerCase().endsWith('.pdf');

  return (
    <SlideReviewerClient
      courseName={courseName}
      courseId={courseId}
      fileName={data.fileName}
      fileId={uploadId}
      slides={data.slides}
      isPDF={isPDF}
      pdfFile={data.pdfFile}
    />
  );
}
