import { BASE_PATH } from "@/lib/constants";

type FigureCardProps = {
  src: string;
  caption: string;
};

export function FigureCard({ src, caption }: FigureCardProps) {
  return (
    <figure className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-4 shadow-[var(--shadow)]">
      <img
        src={`${BASE_PATH}${src}`}
        alt={caption}
        className="h-auto w-full rounded-2xl border border-[color:var(--border)]"
      />
      <figcaption className="mt-3 text-xs text-[color:var(--muted)]">
        {caption}
      </figcaption>
    </figure>
  );
}
