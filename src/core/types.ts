/** Result of an operation that can fail with a human-readable message. */
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const fail = <T = never>(error: string): Result<T> => ({ ok: false, error });

/** An IPv4 address or mask stored as an unsigned 32-bit integer. */
export type Uint32 = number;

export type AddressClass = "A" | "B" | "C" | "D (multicast)" | "E (reserved)";

export type SubnetKind = "network" | "point-to-point" | "single-host";

export interface SubnetInfo {
  kind: SubnetKind;
  address: Uint32;
  prefix: number;
  mask: Uint32;
  wildcard: Uint32;
  network: Uint32;
  broadcast: Uint32;
  firstUsable: Uint32;
  lastUsable: Uint32;
  totalAddresses: number;
  usableHosts: number;
  addressClass: AddressClass;
  isPrivate: boolean;
}
