import { toDotted } from "./core/format.js";
import { prefixToMask } from "./core/ip.js";
import { parseMask, parseSubnetFields } from "./core/input.js";
import { parseHostList, splitVariableLength } from "./core/vlsm.js";
import { getFormElements } from "./ui/form.js";
import { renderEmpty, renderError, renderResult } from "./ui/render.js";

const DEFAULT_ADDRESS = "192.168.1.0";
const DEFAULT_MASK = "/24";
const DEFAULT_HOSTS = "100, 50";

function start(): void {
  const elements = getFormElements();
  const { form, addressInput, maskInput, cidrInput, cidrValue, hostsInput, clearButton, output } = elements;

  /** Show the prefix on the slider and its label. */
  function showPrefix(prefix: number): void {
    cidrInput.value = String(prefix);
    cidrValue.textContent = `/${prefix}`;
  }

  /** Recalculate from the current field values and redraw the results. */
  function refresh(): void {
    const parsed = parseSubnetFields(addressInput.value, maskInput.value);
    if (!parsed.ok) {
      renderError(output, parsed.error);
      return;
    }
    const hosts = parseHostList(hostsInput.value);
    if (!hosts.ok) {
      renderError(output, hosts.error);
      return;
    }
    const result = splitVariableLength(parsed.value.address, parsed.value.prefix, hosts.value);
    if (!result.ok) {
      renderError(output, result.error);
      return;
    }
    renderResult(output, result.value);
  }

  /** Typing in the mask field moves the slider when the mask is valid. */
  function onMaskTyped(): void {
    const parsed = parseMask(maskInput.value);
    if (parsed.ok) showPrefix(parsed.value);
    refresh();
  }

  /** Moving the slider rewrites the mask field as a dotted mask. */
  function onSliderMoved(): void {
    const prefix = Number(cidrInput.value);
    maskInput.value = toDotted(prefixToMask(prefix));
    showPrefix(prefix);
    refresh();
  }

  /** Clear every input and the results. */
  function onClear(): void {
    addressInput.value = "";
    maskInput.value = "";
    hostsInput.value = "";
    showPrefix(24);
    renderEmpty(output);
    addressInput.focus();
  }

  addressInput.addEventListener("input", refresh);
  maskInput.addEventListener("input", onMaskTyped);
  cidrInput.addEventListener("input", onSliderMoved);
  hostsInput.addEventListener("input", refresh);
  clearButton.addEventListener("click", onClear);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    refresh();
  });

  if (addressInput.value.trim() === "") addressInput.value = DEFAULT_ADDRESS;
  if (maskInput.value.trim() === "") maskInput.value = DEFAULT_MASK;
  if (hostsInput.value.trim() === "") hostsInput.value = DEFAULT_HOSTS;

  const initial = parseMask(maskInput.value);
  if (initial.ok) {
    showPrefix(initial.value);
    maskInput.value = toDotted(prefixToMask(initial.value));
  }
  refresh();
}

start();
