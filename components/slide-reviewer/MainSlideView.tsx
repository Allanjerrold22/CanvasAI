import type { SlideData } from "@/lib/slides";

type MainSlideViewProps = {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
};

export default function MainSlideView({
  slide,
  slideIndex,
  totalSlides,
}: MainSlideViewProps) {
  return (
    <div className="bg-surface border border-ink-border rounded-2xl shadow-card p-8">
      <h2 className="text-[20px] font-semibold mb-4">{slide.title}</h2>

      {slide.bullets.length > 0 && (
        <ul className="flex flex-col gap-2">
          {slide.bullets.map((bullet, i) => (
            <li key={i} className="text-[14px] text-ink leading-relaxed">
              • {bullet}
            </li>
          ))}
        </ul>
      )}

      {slide.hasImage && (
        <div className="mt-4 h-40 bg-surface-muted rounded-xl border border-ink-border grid place-items-center text-ink-subtle text-[13px]">
          Image placeholder
        </div>
      )}

      <div
        aria-live="polite"
        className="text-[12px] text-ink-muted mt-4"
      >
        Slide {slideIndex + 1} of {totalSlides}
      </div>
    </div>
  );
}
