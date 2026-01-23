import type { NextConfig } from "next";

const basePathValue = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();
const normalizedBasePath =
  basePathValue === "" || basePathValue === "/"
    ? ""
    : `/${basePathValue.replace(/^\//, "")}`;

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: normalizedBasePath || undefined,
  assetPrefix: normalizedBasePath ? `${normalizedBasePath}/` : undefined,
};

export default nextConfig;
