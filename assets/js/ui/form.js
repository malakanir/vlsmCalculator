/** DOM access for the VLSM form. Only this module knows the element ids. */
export function getFormElements() {
    const form = document.getElementById("vlsm-form");
    const addressInput = document.getElementById("vlsm-address");
    const maskInput = document.getElementById("vlsm-mask");
    const cidrInput = document.getElementById("vlsm-cidr");
    const cidrValue = document.getElementById("vlsm-cidr-value");
    const hostsInput = document.getElementById("vlsm-hosts");
    const clearButton = document.getElementById("vlsm-clear");
    const output = document.getElementById("vlsm-output");
    if (!(form instanceof HTMLFormElement) ||
        !(addressInput instanceof HTMLInputElement) ||
        !(maskInput instanceof HTMLInputElement) ||
        !(cidrInput instanceof HTMLInputElement) ||
        !(cidrValue instanceof HTMLElement) ||
        !(hostsInput instanceof HTMLInputElement) ||
        !(clearButton instanceof HTMLButtonElement) ||
        !(output instanceof HTMLElement)) {
        throw new Error("VLSM form markup is missing one of the required element ids.");
    }
    return { form, addressInput, maskInput, cidrInput, cidrValue, hostsInput, clearButton, output };
}
