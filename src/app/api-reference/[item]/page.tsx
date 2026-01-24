import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllApiItemNames, getApiItemDetail } from "@/lib/api-item-details";

type Props = {
    params: Promise<{ item: string }>;
};

export async function generateStaticParams() {
    return getAllApiItemNames().map((item) => ({ item }));
}

export default async function ApiItemPage({ params }: Props) {
    const { item: itemName } = await params;
    const detail = getApiItemDetail(itemName);

    if (!detail) {
        notFound();
    }

    return (
        <div className="mx-auto w-full max-w-4xl px-6 pb-20 pt-12">
            {/* Breadcrumb */}
            <nav className="mb-4 text-sm text-[color:var(--muted)]">
                <Link href="/api-reference/" className="hover:text-[color:var(--ink)]">
                    API Reference
                </Link>
                <span className="mx-2">›</span>
                <span className="text-[color:var(--ink)]">{detail.name}</span>
            </nav>

            {/* Title */}
            <h1 className="text-3xl font-bold font-mono">{detail.module}.{detail.name}</h1>

            {/* Signature */}
            <div className="mt-4 rounded-lg bg-[color:var(--ink)] p-4">
                <code className="text-sm text-white whitespace-pre-wrap">{detail.signature}</code>
                <div className="mt-2 text-right">
                    <a
                        href={`https://github.com/ZipengWu365/TS-component-structure-Recover-library`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-300 hover:underline"
                    >
                        [source]
                    </a>
                </div>
            </div>

            {/* Description */}
            <p className="mt-6 text-[color:var(--ink)]">{detail.description}</p>

            {/* Parameters */}
            {detail.parameters && detail.parameters.length > 0 && (
                <section className="mt-8">
                    <h2 className="text-lg font-bold border-b border-[color:var(--border)] pb-2">Parameters</h2>
                    <dl className="mt-4 space-y-3">
                        {detail.parameters.map((param) => (
                            <div key={param.name}>
                                <dt>
                                    <code className="font-bold text-[color:var(--ink)]">{param.name}</code>
                                    <span className="text-[color:var(--muted)]"> : </span>
                                    <code className="text-[color:var(--accent-strong)]">{param.type}</code>
                                </dt>
                                <dd className="ml-6 text-sm text-[color:var(--muted)]">{param.description}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}

            {/* Returns */}
            {detail.returns && (
                <section className="mt-8">
                    <h2 className="text-lg font-bold border-b border-[color:var(--border)] pb-2">Returns</h2>
                    <div className="mt-4">
                        <code className="text-[color:var(--accent-strong)]">{detail.returns.type}</code>
                        <p className="ml-6 mt-1 text-sm text-[color:var(--muted)]">{detail.returns.description}</p>
                    </div>
                </section>
            )}

            {/* Examples */}
            <section className="mt-8">
                <h2 className="text-lg font-bold border-b border-[color:var(--border)] pb-2">Examples</h2>
                <div className="mt-4 space-y-6">
                    {detail.examples.map((example, idx) => (
                        <div key={idx}>
                            <p className="text-sm font-semibold text-[color:var(--ink)] mb-2">{example.title}</p>
                            <pre className="overflow-x-auto rounded-lg bg-[color:var(--ink)] p-4 text-sm text-green-300">
                                <code>{example.code}</code>
                            </pre>
                        </div>
                    ))}
                </div>
            </section>

            {/* See Also */}
            {detail.seeAlso && detail.seeAlso.length > 0 && (
                <section className="mt-8">
                    <h2 className="text-lg font-bold border-b border-[color:var(--border)] pb-2">See Also</h2>
                    <div className="mt-4 flex flex-wrap gap-3">
                        {detail.seeAlso.map((item) => (
                            <Link
                                key={item}
                                href={`/api-reference/${item}/`}
                                className="rounded-full border border-[color:var(--border)] px-3 py-1 text-sm font-mono text-[color:var(--accent-strong)] hover:bg-gray-50"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Back link */}
            <div className="mt-12 pt-6 border-t border-[color:var(--border)]">
                <Link href="/api-reference/" className="text-sm text-[color:var(--accent-strong)] hover:underline">
                    ← Back to API Reference
                </Link>
            </div>
        </div>
    );
}
