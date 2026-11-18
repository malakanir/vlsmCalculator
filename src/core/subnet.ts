import { prefixToMask } from "./ip.js";
import type { AddressClass, SubnetInfo, Uint32 } from "./types.js";

/** Classful category from the first octet of the address (pre-CIDR view). */
function classify(address: Uint32): AddressClass {
  const first = address >>> 24;
  if (first < 128) return "A";
  if (first < 192) return "B";
  if (first < 224) return "C";
  if (first < 240) return "D (multicast)";
  return "E (reserved)";
}

/** RFC 1918 private ranges: 10/8, 172.16/12, 192.168/16. */
function isRfc1918(address: Uint32): boolean {
  const first = address >>> 24;
  const second = (address >>> 16) & 0xff;
  if (first === 10) return true;
  if (first === 172 && second >= 16 && second <= 31) return true;
  if (first === 192 && second === 168) return true;
  return false;
}

/**
 * Compute subnet details for an address and prefix length.
 * /31 is point-to-point and /32 is a single host (RFC 3021): no network or
 * broadcast is reserved, so every address is usable in those cases.
 */
export function computeSubnet(address: Uint32, prefix: number): SubnetInfo {
  const mask = prefixToMask(prefix);
  const wildcard = (~mask) >>> 0;
  const network = (address & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);

  let kind: SubnetInfo["kind"] = "network";
  let firstUsable: Uint32 = (network + 1) >>> 0;
  let lastUsable: Uint32 = (broadcast - 1) >>> 0;
  let usableHosts = Math.max(totalAddresses - 2, 0);

  if (prefix === 32) {
    kind = "single-host";
    firstUsable = network;
    lastUsable = network;
    usableHosts = 1;
  } else if (prefix === 31) {
    kind = "point-to-point";
    firstUsable = network;
    lastUsable = broadcast;
    usableHosts = 2;
  }

  return {
    kind,
    address,
    prefix,
    mask,
    wildcard,
    network,
    broadcast,
    firstUsable,
    lastUsable,
    totalAddresses,
    usableHosts,
    addressClass: classify(address),
    isPrivate: isRfc1918(address),
  };
}
