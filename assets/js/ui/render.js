import { toDotted, toDottedBinary } from "../core/format.js";
import { MAX_ROWS } from "../core/vlsm.js";
const number = (value) => value.toLocaleString("en-US");
function termRow(list, label, value) {
    const term = document.createElement("dt");
    term.textContent = label;
    const detail = document.createElement("dd");
    detail.textContent = value;
    list.append(term, detail);
}
const HEADINGS = [
    "Subnet Name",
    "Network",
    "First Usable IP",
    "Last Usable IP",
    "Broadcast",
    "Total Usable Host",
    "Total Available Host",
    "Netmask",
    "Wildcard",
];
/** One row of the table: name, then the nine columns in HEADINGS order. */
function blockRow(name, block) {
    const row = document.createElement("tr");
    const values = [
        name,
        toDotted(block.network),
        toDotted(block.firstUsable),
        toDotted(block.lastUsable),
        toDotted(block.broadcast),
        number(block.usableHosts),
        number(block.totalAddresses),
        toDotted(block.mask),
        toDotted(block.wildcard),
    ];
    for (const value of values) {
        const td = document.createElement("td");
        td.textContent = value;
        row.append(td);
    }
    return row;
}
function blockTable(rows) {
    const wrap = document.createElement("div");
    wrap.className = "table-wrap";
    const table = document.createElement("table");
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");
    for (const label of HEADINGS) {
        const th = document.createElement("th");
        th.scope = "col";
        th.textContent = label;
        headRow.append(th);
    }
    head.append(headRow);
    const body = document.createElement("tbody");
    body.append(...rows);
    table.append(head, body);
    wrap.append(table);
    return wrap;
}
function heading(text) {
    const h = document.createElement("h2");
    h.textContent = text;
    return h;
}
function note(text) {
    const p = document.createElement("p");
    p.className = "note";
    p.textContent = text;
    return p;
}
/** Summary, the allocation table, and the free block table. Values use textContent only. */
export function renderResult(output, result) {
    output.replaceChildren();
    const summary = document.createElement("dl");
    termRow(summary, "Original prefix", `/${result.originalPrefix}`);
    termRow(summary, "Subnet mask", `${toDotted(result.mask)} (${toDottedBinary(result.mask)})`);
    termRow(summary, "Subnets", number(result.allocations.length));
    termRow(summary, "Addresses allocated", number(result.usedAddresses));
    termRow(summary, "Free addresses", number(result.freeAddresses));
    output.append(summary);
    const allocated = result.allocations.map((item, index) => blockRow(`Subnet ${index + 1}`, item.subnet));
    output.append(heading("Variable Length Subnetting"), blockTable(allocated));
    output.append(heading("Free / Unused IP Network"));
    if (result.freeAddresses === 0) {
        output.append(note("No free space. The requirements fill the whole network."));
    }
    else {
        output.append(note("Free blocks are listed in address order, each sized as its own subnet."));
        const free = result.free.map((block, index) => blockRow(`Free ${index + 1}`, block));
        output.append(blockTable(free));
        if (result.freeTruncated) {
            output.append(note(`Showing the first ${number(MAX_ROWS)} free blocks.`));
        }
    }
}
/** Show an error message in place of the results. */
export function renderError(output, message) {
    output.replaceChildren();
    const p = document.createElement("p");
    p.className = "error";
    p.setAttribute("role", "alert");
    p.textContent = message;
    output.append(p);
}
/** Clear the results area back to its empty state. */
export function renderEmpty(output) {
    output.replaceChildren();
}
