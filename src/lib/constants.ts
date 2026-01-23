export const DATA_VERSION = "v1.0.0";

const basePathValue = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();
export const BASE_PATH =
  basePathValue === "" || basePathValue === "/"
    ? ""
    : `/${basePathValue.replace(/^\//, "")}`;
