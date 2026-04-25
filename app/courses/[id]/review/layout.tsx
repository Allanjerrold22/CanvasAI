/**
 * Immersive layout for the slide reviewer — no sidebar, full-screen experience.
 */
export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#fafafa]" style={{ marginLeft: 0 }}>
      {children}
    </div>
  );
}
