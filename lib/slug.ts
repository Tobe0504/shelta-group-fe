/** URL-safe id from a name, e.g. "Sand & granite" → "sand-granite". Must match the API's slug rule. */
export const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
