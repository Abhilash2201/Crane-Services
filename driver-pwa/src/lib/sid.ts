export const sid = (id?: string | null): string =>
  id ? id.replace(/-/g, "").slice(0, 6).toUpperCase() : "------";
