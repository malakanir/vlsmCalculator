import { maskToPrefix, parseIPv4 } from "./ip.js";
import { fail, ok } from "./types.js";
const PREFIX_PATTERN = /^\/?\d{1,2}$/;
/** Parse "/26" or "26" into a prefix length 0-32. */
function parsePrefix(text) {
    const trimmed = text.trim();
    if (!PREFIX_PATTERN.test(trimmed)) {
        return fail(`"${text}" is not a valid prefix (use /0 to /32).`);
    }
    const prefix = Number(trimmed.replace("/", ""));
    if (prefix > 32) {
        return fail(`Prefix /${prefix} is out of range (use /0 to /32).`);
    }
    return ok(prefix);
}
/**
 * Parse the subnet mask field into a prefix length.
 * Accepts a dotted mask ("255.255.255.192") or a CIDR prefix ("/26" or "26").
 */
export function parseMask(text) {
    const mask = text.trim();
    if (mask === "") {
        return fail("Enter a subnet mask (255.255.255.192) or a CIDR prefix (/26).");
    }
    if (mask.includes(".")) {
        const maskValue = parseIPv4(mask);
        if (!maskValue.ok)
            return maskValue;
        const prefix = maskToPrefix(maskValue.value);
        if (prefix === null) {
            return fail(`"${mask}" is not a valid subnet mask (ones must be contiguous).`);
        }
        return ok(prefix);
    }
    return parsePrefix(mask);
}
/** Parse the address field and the mask field together. */
export function parseSubnetFields(addressText, maskText) {
    const address = parseIPv4(addressText);
    if (!address.ok)
        return address;
    const prefix = parseMask(maskText);
    if (!prefix.ok)
        return prefix;
    return ok({ address: address.value, prefix: prefix.value });
}
