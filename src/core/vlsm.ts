import { prefixToMask } from "./ip.js";
import { computeSubnet } from "./subnet.js";
import { fail, ok, type Result, type SubnetInfo, type Uint32 } from "./types.js";

/** Largest number of rows rendered per table. Larger lists report `truncated`. */
export const MAX_ROWS = 256;
/** Largest number of host requirements accepted in one calculation. */
export const MAX_REQUIREMENTS = 256;

export interface Allocation {
  /** Usable hosts requested for this subnet. */
  hosts: number;
  subnet: SubnetInfo;
}

export interface VlsmResult {
  originalPrefix: number;
  mask: Uint32;
  allocations: Allocation[];
  /** Total addresses in the base network. */
  networkSize: number;
  /** Addresses handed out to subnets, block sizes included. */
  usedAddresses: number;
  /** Addresses left over. */
  freeAddresses: number;
  free: SubnetInfo[];
  freeTruncated: boolean;
}

/** Smallest number of bits b such that 2^b >= value. */
function bitsFor(value: number): number {
  let bits = 0;
  while (2 ** bits < value) bits++;
  return bits;
}

/**
 * Parse "100, 50, 25" into positive integers.
 * Blank entries are ignored, so trailing commas are fine.
 */
export function parseHostList(text: string): Result<number[]> {
  const parts = text
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "");
  if (parts.length === 0) {
    return fail("Enter the hosts needed per subnet, separated by commas (for example 100, 50).");
  }
  if (parts.length > MAX_REQUIREMENTS) {
    return fail(`Enter at most ${MAX_REQUIREMENTS} subnets.`);
  }

  const hosts: number[] = [];
  for (const part of parts) {
    if (!/^\d+$/.test(part)) {
      return fail(`"${part}" is not a whole number of hosts.`);
    }
    const value = Number(part);
    if (value < 1) {
      return fail("Each subnet needs at least 1 host.");
    }
    hosts.push(value);
  }
  return ok(hosts);
}

/**
 * Split the free range [start, end) into the fewest aligned power-of-two blocks,
 * in address order. Each block is a valid subnet on its own.
 */
function alignedBlocks(start: number, end: number): SubnetInfo[] {
  const blocks: SubnetInfo[] = [];
  let cursor = start;
  while (cursor < end) {
    let size = 1;
    while (cursor % (size * 2) === 0 && size * 2 <= end - cursor) size *= 2;
    const prefix = 32 - Math.round(Math.log2(size));
    blocks.push(computeSubnet(cursor, prefix));
    cursor += size;
  }
  return blocks;
}

/**
 * Variable Length Subnet Mask. Each requirement gets the smallest block that fits
 * its usable hosts. Requirements are placed largest first, so every block starts
 * on its own boundary and the blocks pack without gaps. The leftover space is
 * returned as aligned free blocks.
 */
export function splitVariableLength(
  address: Uint32,
  prefix: number,
  hostRequirements: number[],
): Result<VlsmResult> {
  if (hostRequirements.length === 0) {
    return fail("Enter at least one host requirement.");
  }
  for (const hosts of hostRequirements) {
    if (!Number.isInteger(hosts) || hosts < 1) {
      return fail("Each host requirement must be a whole number, at least 1.");
    }
  }

  const networkSize = 2 ** (32 - prefix);
  const sorted = [...hostRequirements].sort((a, b) => b - a);

  // Every block must be no larger than the base network.
  const blockBits = sorted.map((hosts) => bitsFor(hosts + 2));
  const needed = blockBits.reduce((sum, bits) => sum + 2 ** bits, 0);
  if (blockBits.some((bits) => 32 - bits < prefix) || needed > networkSize) {
    return fail(
      `The requirements need ${needed.toLocaleString("en-US")} addresses, but /${prefix} has ${networkSize.toLocaleString("en-US")}.`,
    );
  }

  const base = (address & prefixToMask(prefix)) >>> 0;
  const allocations: Allocation[] = [];
  let cursor = base;
  sorted.forEach((hosts, index) => {
    const bits = blockBits[index] ?? 0;
    const subnet = computeSubnet(cursor, 32 - bits);
    allocations.push({ hosts, subnet });
    cursor += 2 ** bits;
  });

  const end = base + networkSize;
  const free = alignedBlocks(cursor, end);
  const freeAddresses = end - cursor;
  const freeListed = free.slice(0, MAX_ROWS);

  return ok({
    originalPrefix: prefix,
    mask: prefixToMask(prefix),
    allocations,
    networkSize,
    usedAddresses: needed,
    freeAddresses,
    free: freeListed,
    freeTruncated: free.length > freeListed.length,
  });
}
