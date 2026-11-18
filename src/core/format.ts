import type { Uint32 } from "./types.js";

/** Format a uint32 as dotted decimal, e.g. 3232235776 -> "192.168.1.0". */
export function toDotted(value: Uint32): string {
  return [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ].join(".");
}

/** Format a uint32 as dotted binary, e.g. "11111111.11111111.11111111.11000000". */
export function toDottedBinary(value: Uint32): string {
  return [24, 16, 8, 0]
    .map((shift) => ((value >>> shift) & 0xff).toString(2).padStart(8, "0"))
    .join(".");
}
