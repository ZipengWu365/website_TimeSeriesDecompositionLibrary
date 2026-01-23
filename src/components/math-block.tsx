"use client";

import clsx from "clsx";
import katex from "katex";

type MathBlockProps = {
  latex: string;
  className?: string;
};

export function MathBlock({ latex, className }: MathBlockProps) {
  const html = katex.renderToString(latex, {
    displayMode: true,
    throwOnError: false,
  });

  return (
    <div
      className={clsx(
        "overflow-x-auto rounded-xl border border-[color:var(--border)] bg-white/95 p-3 text-[color:var(--ink)]",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
