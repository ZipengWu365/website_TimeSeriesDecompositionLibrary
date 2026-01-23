import Link from "next/link";
import { USER_GUIDE_SECTIONS } from "@/lib/user-guide-content";
import { BASE_PATH } from "@/lib/constants";

export default function UserGuidePage() {
    return (
        <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
                    User Guide
                </p>
                <h1 className="text-3xl font-semibold md:text-4xl">
                    Time Series Decomposition Benchmark
                </h1>
                <p className="text-sm text-[color:var(--muted)]">
                    A comprehensive guide to decomposition methods, evaluation metrics, and benchmark scenarios.
                </p>
            </div>

            <section className="mt-10 space-y-4">
                {USER_GUIDE_SECTIONS.map((section) => (
                    <Link
                        key={section.id}
                        href={`/user-guide/${section.id}/`}
                        className="block rounded-2xl border border-[color:var(--border)] bg-white/90 p-5 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
                    >
                        <div className="flex items-start gap-4">
                            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-lg font-bold text-white">
                                {section.number}
                            </span>
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold">{section.title}</h2>
                                <p className="mt-1 text-sm text-[color:var(--muted)]">
                                    {section.description}
                                </p>
                                {section.subsections && section.subsections.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {section.subsections.map((sub) => (
                                            <span
                                                key={sub.id}
                                                className="rounded-full border border-[color:var(--border)] px-2 py-0.5 text-xs text-[color:var(--muted)]"
                                            >
                                                {sub.title}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </section>

            <section className="mt-12 rounded-2xl border border-[color:var(--border)] bg-[color:var(--accent)]/5 p-6">
                <h3 className="font-semibold">Quick Start</h3>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-[color:var(--ink)] p-4 text-sm text-white">
                    {`pip install tsdecomp

python -m tsdecomp suite_run \\
    --suite core \\
    --methods stl,mstl,ssa,vmd \\
    --out runs/`}
                </pre>
            </section>
        </div>
    );
}
