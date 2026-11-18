import { fail, ok, type Result, type Uint32 } from "./types.js";

const OCTET_PATTERN = /^\d{1,3}$/;

/** Parse dotted-quad IPv4 text such as "192.168.10.1" into a uint32. */
export function parseIPv4(text: string): Result<Uint32> {
  const parts = text.trim().split(".");
  if (parts.length !== 4) {
    return fail(`"${text}" is not an IPv4 address (expected four octets).`);
  }

  let value = 0;
  for (const part of parts) {
    if (!OCTET_PATTERN.test(part)) {
      return fail(`"${text}" has an invalid octet "${part}".`);
    }
    const octet = Number(part);
    if (octet > 255) {
      return fail(`"${text}" has an octet out of range (${octet}, must be 0-255).`);
    }
    value = value * 256 + octet;
  }
  return ok(value >>> 0);
}

/** Build a netmask from a prefix length (0-32). */
export function prefixToMask(prefix: number): Uint32 {
  if (prefix === 0) return 0;
  return (0xffffffff << (32 - prefix)) >>> 0;
}

/** Return the prefix length for a contiguous netmask, or null if it is not contiguous. */
export function maskToPrefix(mask: Uint32): number | null {
  let prefix = 0;
  let seenZero = false;
  for (let bit = 31; bit >= 0; bit--) {
    const set = ((mask >>> bit) & 1) === 1;
    if (set) {
      if (seenZero) return null;
      prefix++;
    } else {
      seenZero = true;
    }
  }
  return prefix;
}
