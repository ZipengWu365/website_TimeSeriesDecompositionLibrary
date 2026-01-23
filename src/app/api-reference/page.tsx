import { getApiReference } from "@/lib/data";

export default async function ApiReferencePage() {
  const api = await getApiReference();
  const sourceRepo = api.source_repo;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          API Reference
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">
          Auto-generated from the tsdecomp codebase.
        </h1>
        <p className="text-sm text-[color:var(--muted)]">
          Generated at {api.generated_at}
          {sourceRepo ? " from " : "."}
          {sourceRepo ? (
            <>
              <a
                href={sourceRepo}
                className="text-[color:var(--accent-strong)]"
                target="_blank"
                rel="noreferrer"
              >
                {sourceRepo}
              </a>
              .
            </>
          ) : null}
        </p>
      </div>

      <section className="mt-10 space-y-6">
        {api.sections.map((section) => (
          <div
            key={section.module}
            className="rounded-3xl border border-[color:var(--border)] bg-white/90 p-6 shadow-[var(--shadow)]"
          >
            <h2 className="text-xl font-semibold">{section.module}</h2>
            {section.description ? (
              <p className="mt-2 text-sm text-[color:var(--muted)]">{section.description}</p>
            ) : null}
            <div className="mt-4 space-y-4">
              {section.items.map((item) => (
                <div
                  key={`${section.module}-${item.name}`}
                  className="rounded-2xl border border-[color:var(--border)] bg-white/80 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{item.name}</p>
                    {item.source ? (
                      <span className="text-xs text-[color:var(--muted)]">{item.source}</span>
                    ) : null}
                  </div>
                  <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-[color:var(--ink)]/95 p-3 text-xs text-white">
                    {item.signature}
                  </pre>
                  {item.docstring ? (
                    <p className="mt-3 text-sm text-[color:var(--muted)]">{item.docstring}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
