import Link from "next/link";
import { getApiReference } from "@/lib/data";

export default async function ApiReferencePage() {
  const api = await getApiReference();
  const sourceRepo = api.source_repo;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 pb-20 pt-12">
      {/* Header */}
      <h1 className="text-3xl font-bold">API Reference</h1>
      <p className="mt-4 text-[color:var(--muted)]">
        This is the class and function reference of tsdecomp. Please refer to the{" "}
        <Link href="/user-guide/" className="text-[color:var(--accent-strong)] hover:underline">
          full user guide
        </Link>{" "}
        for further details, as the raw specifications of classes and functions may not be enough
        to give full guidelines on their use.
      </p>

      {/* Table */}
      <div className="mt-8 overflow-hidden rounded-lg border border-[color:var(--border)]">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-[color:var(--border)]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-[color:var(--ink)]">Object</th>
              <th className="px-4 py-3 text-left font-semibold text-[color:var(--ink)]">Description</th>
            </tr>
          </thead>
          <tbody>
            {api.sections.map((section, sectionIdx) => (
              <>
                {/* Module header row */}
                <tr key={`header-${section.module}`} className="bg-gray-100/50 border-t border-[color:var(--border)]">
                  <td colSpan={2} className="px-4 py-3">
                    <span className="font-mono font-bold text-[color:var(--ink)]">{section.module}</span>
                    {section.description && (
                      <span className="ml-3 text-[color:var(--muted)]">— {section.description}</span>
                    )}
                  </td>
                </tr>
                {/* Items */}
                {section.items.map((item, itemIdx) => (
                  <tr
                    key={`${section.module}-${item.name}`}
                    className="border-t border-[color:var(--border)] hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <code className="text-[color:var(--accent-strong)] hover:underline">
                        {item.name}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--muted)]">
                      {item.docstring || "—"}
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Source info */}
      <p className="mt-6 text-xs text-[color:var(--muted)]">
        Generated at {api.generated_at}
        {sourceRepo && (
          <>
            {" from "}
            <a
              href={sourceRepo}
              target="_blank"
              rel="noreferrer"
              className="text-[color:var(--accent-strong)] hover:underline"
            >
              source repository
            </a>
          </>
        )}
        .
      </p>
    </div>
  );
}
