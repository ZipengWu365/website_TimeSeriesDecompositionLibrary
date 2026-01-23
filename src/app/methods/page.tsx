import { getMethods } from "@/lib/data";
import MethodsClient from "@/app/methods/methods-client";

export default async function MethodsPage() {
  const methods = await getMethods();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
          Methods
        </p>
        <h1 className="text-3xl font-semibold md:text-4xl">Registry of decomposition wrappers.</h1>
        <p className="text-sm text-[color:var(--muted)]">
          Each method lists its wrapper config, period requirements, and expected diagnostic
          signatures.
        </p>
      </div>

      <MethodsClient methods={methods.methods} />
    </div>
  );
}
