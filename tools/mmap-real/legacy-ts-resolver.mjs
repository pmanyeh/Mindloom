// Local importer-baseline runner only: native Node strips TS, but the accepted
// legacy source uses extensionless imports. Never rewrite those source files.
// @public Node loader hook, registered only for opt-in local importer evidence.
export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (
      !["ERR_MODULE_NOT_FOUND", "ERR_UNSUPPORTED_DIR_IMPORT"].includes(error.code) ||
      !specifier.startsWith(".") ||
      !context.parentURL?.startsWith(new URL("../../src/", import.meta.url).href)
    )
      throw error;
    for (const suffix of [".ts", "/index.ts"]) {
      try {
        return await nextResolve(`${specifier}${suffix}`, context);
      } catch (candidate) {
        if (candidate.code !== "ERR_MODULE_NOT_FOUND") throw candidate;
      }
    }
    throw error;
  }
}
