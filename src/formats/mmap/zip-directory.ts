// Read-only ZIP32 structural bounds checks before fflate visits the directory.
// Header layout reference: PKWARE APPNOTE 6.3.10 sections 4.3.7 / 4.3.12 / 4.3.16.
// No extraction to disk, encryption implementation or ZIP writer.
export const MAX_PACKAGE_BYTES = 64 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 16 * 1024 * 1024;
const MAX_ENTRIES = 10_000;

export function checkZipDirectory(bytes: Uint8Array): string[] {
  if (bytes.length > MAX_PACKAGE_BYTES)
    throw new Error("Package exceeds the 64 MiB inspection limit.");
  if (bytes.length < 22) throw new Error("Not a ZIP: end-of-central-directory record is missing.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u16 = (offset: number) => view.getUint16(offset, true);
  const u32 = (offset: number) => view.getUint32(offset, true);
  const requireZip = (ok: boolean, message: string) => {
    if (!ok) throw new Error(`Unsupported or malformed ZIP: ${message}`);
  };
  let end = bytes.length - 22;
  const earliest = Math.max(0, end - 65_535);
  while (end >= earliest && !(u32(end) === 0x06054b50 && end + 22 + u16(end + 20) === bytes.length))
    end--;
  requireZip(end >= earliest, "end-of-central-directory record is missing or truncated.");
  requireZip(u16(end + 4) === 0 && u16(end + 6) === 0, "multi-disk archives are not supported.");
  const count = u16(end + 10);
  const size = u32(end + 12);
  const start = u32(end + 16);
  requireZip(
    count !== 0xffff &&
      size !== 0xffffffff &&
      start !== 0xffffffff &&
      !(end >= 20 && u32(end - 20) === 0x07064b50),
    "ZIP64 is not supported in Batch 1.",
  );
  requireZip(
    count === u16(end + 8) && count <= MAX_ENTRIES,
    "entry count mismatch or over 10,000 entries.",
  );
  requireZip(start + size === end, "central directory bounds do not match the archive.");
  let cursor = start;
  const crcs: string[] = [];
  for (let index = 0; index < count; index++) {
    requireZip(cursor + 46 <= end && u32(cursor) === 0x02014b50, "invalid central entry header.");
    const flags = u16(cursor + 8);
    const method = u16(cursor + 10);
    const compressed = u32(cursor + 20);
    const original = u32(cursor + 24);
    const nameLength = u16(cursor + 28);
    const extraLength = u16(cursor + 30);
    const next = cursor + 46 + nameLength + extraLength + u16(cursor + 32);
    const local = u32(cursor + 42);
    requireZip(!(flags & 0x2041), "encrypted entries are not supported.");
    requireZip(u16(cursor + 34) === 0, "entry is on another disk.");
    requireZip(
      compressed !== 0xffffffff && original !== 0xffffffff && local !== 0xffffffff,
      "ZIP64 entry sizes/offsets are not supported.",
    );
    requireZip(
      next <= end && local + 30 <= start && u32(local) === 0x04034b50,
      "entry points outside the local-file area.",
    );
    requireZip(
      u16(local + 6) === flags && u16(local + 8) === method && u16(local + 26) === nameLength,
      "local and central entry headers disagree.",
    );
    const dataStart = local + 30 + u16(local + 26) + u16(local + 28);
    requireZip(dataStart + compressed <= start, "entry payload is truncated.");
    for (let n = 0; n < nameLength; n++) {
      requireZip(
        bytes[local + 30 + n] === bytes[cursor + 46 + n],
        "local and central names disagree.",
      );
    }
    requireZip(method !== 0 || compressed === original, "stored entry sizes disagree.");
    crcs.push(
      u32(cursor + 16)
        .toString(16)
        .padStart(8, "0"),
    );
    cursor = next;
  }
  requireZip(cursor === end, "directory count/size mismatch.");
  return crcs; // declared central-directory values; NOT CRC verification
}
