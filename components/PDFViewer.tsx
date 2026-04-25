"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  CaretLeft as CaretLeftIcon,
  CaretRight as CaretRightIcon,
  MagnifyingGlassPlus as ZoomInIcon,
  MagnifyingGlassMinus as ZoomOutIcon,
  DownloadSimple as DownloadIcon,
} from "@phosphor-icons/react/dist/ssr";

type PDFViewerProps = {
  file: string | null;
  className?: string;
};

export default function PDFViewer({ file, className = "" }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const renderPage = useCallback(async () => {
    if (!file || !canvasRef.current || !containerRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const pdf = await pdfjsLib.getDocument(file).promise;
      setNumPages(pdf.numPages);

      const page = await pdf.getPage(pageNumber);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const viewport = page.getViewport({ scale: scale * window.devicePixelRatio });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / window.devicePixelRatio}px`;
      canvas.style.height = `${viewport.height / window.devicePixelRatio}px`;

      await page.render({ canvasContext: ctx, viewport }).promise;
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load PDF");
      setLoading(false);
    }
  }, [file, pageNumber, scale]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  if (!file) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-500">No PDF file provided</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button onClick={() => setPageNumber((p) => Math.max(p - 1, 1))} disabled={pageNumber <= 1}
            className="w-8 h-8 grid place-items-center rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Previous page">
            <CaretLeftIcon size={16} />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
            {loading ? "Loading..." : `${pageNumber} / ${numPages}`}
          </span>
          <button onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))} disabled={pageNumber >= numPages}
            className="w-8 h-8 grid place-items-center rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Next page">
            <CaretRightIcon size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))} disabled={scale <= 0.5}
            className="w-8 h-8 grid place-items-center rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Zoom out">
            <ZoomOutIcon size={16} />
          </button>
          <span className="text-sm text-gray-600 min-w-[50px] text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((s) => Math.min(s + 0.2, 3.0))} disabled={scale >= 3.0}
            className="w-8 h-8 grid place-items-center rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Zoom in">
            <ZoomInIcon size={16} />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button onClick={() => { const a = document.createElement("a"); a.href = file; a.download = "document.pdf"; a.click(); }}
            className="w-8 h-8 grid place-items-center rounded-md hover:bg-gray-200 transition-colors" aria-label="Download PDF">
            <DownloadIcon size={16} />
          </button>
        </div>
      </div>

      {/* PDF canvas */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="flex justify-center">
          {error ? (
            <div className="text-red-600 text-center p-8">
              <p className="font-medium">Error loading PDF</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : (
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
                </div>
              )}
              <canvas ref={canvasRef} className="shadow-lg bg-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}