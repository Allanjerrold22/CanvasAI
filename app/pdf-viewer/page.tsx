"use client";

import { useState } from "react";
import PDFViewer from "@/components/PDFViewer";
import PageHeader from "@/components/PageHeader";
import { UploadSimple as UploadIcon } from "@phosphor-icons/react/dist/ssr";

export default function PDFViewerPage() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<number>(0);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setFileUrl(URL.createObjectURL(file));
      setFileName(file.name);
      setFileSize(file.size);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setFileUrl(URL.createObjectURL(file));
      setFileName(file.name);
      setFileSize(file.size);
    }
  };

  return (
    <div className="px-8 py-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="PDF Viewer"
        subtitle="Upload and view PDF documents with zoom and navigation controls."
      />

      <div className="mt-8">
        {!fileUrl ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-gray-400 transition-colors"
          >
            <UploadIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload a PDF file</h3>
            <p className="text-gray-500 mb-4">Drag and drop a PDF file here, or click to select</p>
            <label className="inline-flex items-center gap-2 bg-[var(--brand)] text-white px-6 py-2 rounded-lg hover:bg-[var(--brand)]/90 transition-colors cursor-pointer">
              <UploadIcon size={16} />
              Choose File
              <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{fileName}</h3>
                <p className="text-sm text-gray-500">{(fileSize / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={() => { setFileUrl(null); setFileName(""); setFileSize(0); }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Upload different file
              </button>
            </div>
            <PDFViewer file={fileUrl} className="h-[800px]" />
          </div>
        )}
      </div>
    </div>
  );
}