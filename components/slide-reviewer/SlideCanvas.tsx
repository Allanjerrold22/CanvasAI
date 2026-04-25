"use client";

import type { SlideData } from "@/lib/slides";

/**
 * Renders a single slide as a presentation-quality canvas that looks like
 * a real slide from Google Slides or PowerPoint.
 *
 * Each slide gets a unique visual treatment based on its index to create
 * variety across the deck, similar to how real presentations use different
 * layouts for title slides, content slides, and section dividers.
 */

type SlideCanvasProps = {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
};

// Slide color themes — rotate through these for visual variety
const SLIDE_THEMES = [
  { bg: "bg-gradient-to-br from-[#1a1a2e] to-[#16213e]", title: "text-white", bullet: "text-white/70", accent: "#e94560", dot: "bg-[#e94560]" },
  { bg: "bg-gradient-to-br from-white to-[#f8f9fa]", title: "text-[#1a1a2e]", bullet: "text-[#4a4a6a]", accent: "#8C1D40", dot: "bg-[#8C1D40]" },
  { bg: "bg-gradient-to-br from-[#0f3460] to-[#16213e]", title: "text-white", bullet: "text-white/70", accent: "#e94560", dot: "bg-[#e94560]" },
  { bg: "bg-gradient-to-br from-[#fafafa] to-[#f0f0f2]", title: "text-[#0b0b0c]", bullet: "text-[#5a5a63]", accent: "#8C1D40", dot: "bg-[#8C1D40]" },
  { bg: "bg-gradient-to-br from-[#1b1b2f] to-[#162447]", title: "text-white", bullet: "text-white/65", accent: "#e43f5a", dot: "bg-[#e43f5a]" },
];

export default function SlideCanvas({ slide, slideIndex, totalSlides }: SlideCanvasProps) {
  const theme = SLIDE_THEMES[slideIndex % SLIDE_THEMES.length];
  const isFirstSlide = slideIndex === 0;

  return (
    <div className={`w-full h-full ${theme.bg} relative overflow-hidden select-none`}>
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full opacity-[0.04]"
        style={{ background: `radial-gradient(circle, ${theme.accent}, transparent 70%)` }}
      />
      <div className="absolute bottom-0 left-0 w-[30%] h-[30%] rounded-full opacity-[0.03]"
        style={{ background: `radial-gradient(circle, ${theme.accent}, transparent 70%)` }}
      />

      {/* Slide content */}
      <div className={`w-full h-full flex flex-col ${isFirstSlide ? "justify-center items-center text-center px-16" : "justify-center px-14 py-10"}`}>
        {/* Slide number badge */}
        <div className={`absolute top-5 left-6 text-[10px] font-mono tracking-wider ${theme.bullet} opacity-50`}>
          {String(slideIndex + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
        </div>

        {/* Title */}
        <h2 className={`${isFirstSlide ? "text-[36px]" : "text-[28px]"} font-bold tracking-tight leading-[1.15] mb-6 ${theme.title}`}>
          {slide.title}
        </h2>

        {/* Accent line under title */}
        <div className="w-12 h-[3px] rounded-full mb-8" style={{ backgroundColor: theme.accent }} />

        {/* Bullet points */}
        {slide.bullets.length > 0 && !isFirstSlide && (
          <ul className="flex flex-col gap-4 max-w-[85%]">
            {slide.bullets.map((bullet, i) => (
              <li
                key={i}
                className={`text-[16px] leading-[1.6] flex items-start gap-4 ${theme.bullet}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className={`w-[6px] h-[6px] rounded-full ${theme.dot} mt-[10px] shrink-0`} />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {/* First slide shows bullets as subtitle */}
        {isFirstSlide && slide.bullets.length > 0 && (
          <p className={`text-[16px] leading-relaxed max-w-lg ${theme.bullet}`}>
            {slide.bullets[0]}
          </p>
        )}

        {/* Image placeholder */}
        {slide.hasImage && (
          <div className={`mt-8 h-28 rounded-xl border border-white/10 grid place-items-center ${theme.bullet} text-[12px] bg-white/5`}>
            📊 Visual content
          </div>
        )}
      </div>

      {/* Bottom accent bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: theme.accent, opacity: 0.6 }} />
    </div>
  );
}
