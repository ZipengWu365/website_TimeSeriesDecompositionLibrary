import Link from "next/link";
import { notFound } from "next/navigation";
import { USER_GUIDE_SECTIONS, SECTION_CONTENT } from "@/lib/user-guide-content";
import { BASE_PATH } from "@/lib/constants";

type Props = {
    params: Promise<{ section: string }>;
};

export async function generateStaticParams() {
    return USER_GUIDE_SECTIONS.map((section) => ({
        section: section.id,
    }));
}

export default async function UserGuideSectionPage({ params }: Props) {
    const { section: sectionId } = await params;

    const section = USER_GUIDE_SECTIONS.find((s) => s.id === sectionId);
    if (!section) {
        notFound();
    }

    const content = SECTION_CONTENT[sectionId];

    // Find prev/next sections
    const currentIndex = USER_GUIDE_SECTIONS.findIndex((s) => s.id === sectionId);
    const prevSection = currentIndex > 0 ? USER_GUIDE_SECTIONS[currentIndex - 1] : null;
    const nextSection = currentIndex < USER_GUIDE_SECTIONS.length - 1 ? USER_GUIDE_SECTIONS[currentIndex + 1] : null;

    return (
        <div className="mx-auto w-full max-w-4xl px-6 pb-20 pt-12">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm text-[color:var(--muted)]">
                <Link href="/user-guide/" className="hover:text-[color:var(--ink)]">
                    User Guide
                </Link>
                <span className="mx-2">›</span>
                <span>{section.title}</span>
            </nav>

            {/* Header */}
            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
                    Section {section.number}
                </p>
                <h1 className="text-3xl font-semibold md:text-4xl">{section.title}</h1>
                {content && (
                    <p className="text-[color:var(--muted)]">{content.overview}</p>
                )}
            </div>

            {/* Content */}
            {content && (
                <article className="prose prose-lg mt-10 max-w-none">
                    {/* Main content as markdown-ish text */}
                    <div
                        className="whitespace-pre-wrap text-[color:var(--ink)]"
                        dangerouslySetInnerHTML={{ __html: content.content.replace(/\n/g, '<br/>') }}
                    />

                    {/* Figures */}
                    {content.figures && content.figures.length > 0 && (
                        <div className="mt-8 space-y-6">
                            {content.figures.map((fig, i) => (
                                <figure key={i} className="rounded-2xl border border-[color:var(--border)] p-4">
                                    <img
                                        src={`${BASE_PATH}${fig.src}`}
                                        alt={fig.caption}
                                        className="w-full rounded-xl"
                                    />
                                    <figcaption className="mt-3 text-center text-sm text-[color:var(--muted)]">
                                        {fig.caption}
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    )}

                    {/* Code examples */}
                    {content.code && content.code.length > 0 && (
                        <div className="mt-8 space-y-4">
                            {content.code.map((block, i) => (
                                <div key={i}>
                                    <h4 className="mb-2 text-sm font-semibold">{block.title}</h4>
                                    <pre className="overflow-x-auto rounded-xl bg-[color:var(--ink)] p-4 text-sm text-white">
                                        {block.code}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    )}
                </article>
            )}

            {/* Prev/Next navigation */}
            <nav className="mt-12 flex items-center justify-between border-t border-[color:var(--border)] pt-6">
                {prevSection ? (
                    <Link
                        href={`/user-guide/${prevSection.id}/`}
                        className="text-sm text-[color:var(--muted)] hover:text-[color:var(--ink)]"
                    >
                        ← {prevSection.number}. {prevSection.title}
                    </Link>
                ) : (
                    <span />
                )}
                {nextSection ? (
                    <Link
                        href={`/user-guide/${nextSection.id}/`}
                        className="text-sm text-[color:var(--accent-strong)] hover:underline"
                    >
                        {nextSection.number}. {nextSection.title} →
                    </Link>
                ) : (
                    <span />
                )}
            </nav>
        </div>
    );
}
