import MethodDetailClient from "@/app/methods/[id]/method-detail-client";
import { getMethods } from "@/lib/data";
import { METHOD_DETAILS } from "@/lib/method-details";

type MethodPageProps = {
  params: { id: string };
};

export async function generateStaticParams() {
  const methods = await getMethods();
  const methodIds = new Set(methods.methods.map((method) => method.method_name));
  Object.keys(METHOD_DETAILS).forEach((methodName) => methodIds.add(methodName));
  return Array.from(methodIds).map((id) => ({ id }));
}

export const dynamicParams = false;
export const dynamic = "force-static";

export default function MethodDetailPage(_: MethodPageProps) {
  return <MethodDetailClient />;
}
