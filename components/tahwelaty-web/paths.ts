const rawBasePath = process.env.EXPO_PUBLIC_BASE_URL ?? "";
const normalizedBasePath = rawBasePath.replace(/^\/+|\/+$/gu, "");

export const publicBasePath = normalizedBasePath ? `/${normalizedBasePath}` : "";

export function publicAssetPath(path: string): string {
  const relativePath = path.replace(/^\/+/, "");
  return `${publicBasePath}/${relativePath}`;
}

export function publicBaseScope(): string {
  return `${publicBasePath}/`;
}
