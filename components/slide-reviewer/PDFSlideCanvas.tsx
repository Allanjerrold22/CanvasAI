"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { SlideData } from "@/lib/slides";

type PDFSlideCanvasProps = {
  slide?: SlideData;
  slideIndex: number;
  totalSlides: number;
  pdfFile?: string;
  isPDF?: boolean;
};

export default function PDFSlideCanvas({
  slide,
  slideIndex,
  totalSlides,
  pdfFile,
  isPDF = false,
}: PDFSlideCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const renderPage = useCallback(async () => {
    if (!isPDF || !pdfFile || !canvasRef.current || !containerRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const pdf = await pdfjsLib.getDocument(pdfFile).promise;
      const pageNum = Math.min(slideIndex + 1, pdf.numPages);
      const page = await pdf.getPage(pageNum);

      const container = containerRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fit the page into the container
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const unscaledViewport = page.getViewport({ scale: 1 });

      const scaleX = containerWidth / unscaledViewport.width;
      const scaleY = containerHeight / unscaledViewport.height;
      const scale = Math.min(scaleX, scaleY);

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
  }, [isPDF, pdfFile, slideIndex]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // PDF rendering
  if (isPDF && pdfFile) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full bg-white relative overflow-hidden flex items-center justify-center"
      >
        {/* Slide number badge */}
        <div className="absolute top-3 left-3 z-10 text-[10px] font-mono tracking-wider text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded">
          {String(slideIndex + 1).padStart(2, "0")} /{" "}
          {String(totalSlides).padStart(2, "0")}
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-[5]">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--brand)] border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="text-red-600 text-center text-sm p-4">
            <p className="font-medium">Error loading PDF</p>
            <p className="text-xs mt-1 text-red-400">{error}</p>
          </div>
        )}

        <canvas ref={canvasRef} className="block" />
      </div>
    );
  }

  // ── Fallback: regular slide rendering ──
  if (!slide) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">No slide data available</p>
      </div>
    );
  }

  const SLIDE_THEMES = [
    { bg: "bg-gradient-to-br from-[#1a1a2e] to-[#16213e]", title: "text-white", bullet: "text-white/70", accent: "#e94560", dot: "bg-[#e94560]" },
    { bg: "bg-gradient-to-br from-white to-[#f8f9fa]", title: "text-[#1a1a2e]", bullet: "text-[#4a4a6a]", accent: "#8C1D40", dot: "bg-[#8C1D40]" },
    { bg: "bg-gradient-to-br from-[#0f3460] to-[#16213e]", title: "text-white", bullet: "text-white/70", accent: "#e94560", dot: "bg-[#e94560]" },
    { bg: "bg-gradient-to-br from-[#fafafa] to-[#f0f0f2]", title: "text-[#0b0b0c]", bullet: "text-[#5a5a63]", accent: "#8C1D40", dot: "bg-[#8C1D40]" },
    { bg: "bg-gradient-to-br from-[#1b1b2f] to-[#162447]", title: "text-white", bullet: "text-white/65", accent: "#e43f5a", dot: "bg-[#e43f5a]" },
  ];

  const theme = SLIDE_THEMES[slideIndex % SLIDE_THEMES.length];
  const isFirstSlide = slideIndex === 0;

  return (
    <div className={`w-full h-full ${theme.bg} relative overflow-hidden select-none`}>
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full opacity-[0.04]"
        style={{ background: `radial-gradient(circle, ${theme.accent}, transparent 70%)` }}
      />
      <div className={`w-full h-full flex flex-col ${isFirstSlide ? "justify-center items-center text-center px-16" : "justify-center px-14 py-10"}`}>
        <div className={`absolute top-5 left-6 text-[10px] font-mono tracking-wider ${theme.bullet} opacity-50`}>
          {String(slideIndex + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
        </div>
        <h2 className={`${isFirstSlide ? "text-[36px]" : "text-[28px]"} font-bold tracking-tight leading-[1.15] mb-6 ${theme.title}`}>
          {slide.title}
        </h2>
        <div className="w-12 h-[3px] rounded-full mb-8" style={{ backgroundColor: theme.accent }} />
        {slide.bullets.length > 0 && !isFirstSlide && (
          <ul className="flex flex-col gap-4 max-w-[85%]">
            {slide.bullets.map((bullet, i) => (
              <li key={i} className={`text-[16px] leading-[1.6] flex items-start gap-4 ${theme.bullet}`}>
                <span className={`w-[6px] h-[6px] rounded-full ${theme.dot} mt-[10px] shrink-0`} />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
        {isFirstSlide && slide.bullets.length > 0 && (
          <p className={`text-[16px] leading-relaxed max-w-lg ${theme.bullet}`}>{slide.bullets[0]}</p>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: theme.accent, opacity: 0.6 }} />
    </div>
  );
}