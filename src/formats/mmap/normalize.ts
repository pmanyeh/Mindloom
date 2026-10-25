import type { MmapInspection } from "./inspector.ts";

/** Stable inspection JSON, not a canonical topic model or a save representation.
 * The caller's filename is excluded so relocating identical bytes does not change output.
 * Inventory arrays are sorted by the inspector using code-unit order, never locale/time.
 */
export function normalizeMmap(inspection: MmapInspection): string {
  const { inputFile: _inputFile, ...normalized } = inspection;
  return `${JSON.stringify(normalized, null, 2)}\n`;
}
