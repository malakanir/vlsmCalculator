# VLSM Calculator

Variable Length Subnet Mask calculator. It splits one network into subnets of different sizes, one per host requirement, and lists the leftover space as free blocks.

Built as a Jekyll site for GitHub Pages. The logic is TypeScript, compiled into `assets/js/`, which Jekyll publishes as-is.

## Usage

1. Enter the **IP Address**, for example `192.168.1.0`.
2. Enter the **Subnet Mask** (`255.255.255.0`) or use the **CIDR** slider (`/24`). The two stay in sync.
3. Enter **Hosts per Subnet** as a comma-separated list, for example `100, 50, 25`.
4. Press **Calculate**. Results also update as you type. **Clear All** resets the form.

Each subnet gets the smallest block that fits its usable hosts, and blocks are placed largest first, so they pack without gaps. The results show:
- **Variable Length Subnetting**: one row per subnet (network, usable range, broadcast, host counts, netmask, wildcard).
- **Free / Unused IP Network**: the leftover space, split into aligned blocks in address order.

An error appears if the requirements need more addresses than the base network has.

## How the split works

- Usable hosts `h` need a block of `2^b` addresses, where `2^b >= h + 2` (network and broadcast are reserved).
- Subnets are sorted from largest to smallest and placed one after another.
- Free space is split into the fewest aligned power-of-two blocks.

## Project layout

```
index.md                Jekyll page (form and results container)
_layouts/default.html   page shell, loads CSS and the compiled JS
_config.yml             Jekyll config; source and build files are excluded
assets/css/style.css    minimal styles
assets/js/              compiled output of src/ (committed)
src/core/               pure logic, no DOM (vlsm, subnet, ip, input, format, types)
src/ui/                 DOM access only (form, render)
src/main.ts             wires the form to core and render
CNAME                   custom domain
```

`src/core` does not touch the DOM, so it can be tested in Node.

## Build

```bash
npm install
npm run build
```

Run `npm run build` after every change to `src/` and commit `assets/js/` with it. GitHub Pages runs Jekyll only and does not run `tsc`.

## Deploy to GitHub Pages

1. Push this folder as the repository root.
2. In **Settings > Pages**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. The custom domain is set by `CNAME`. Enable **Enforce HTTPS** once the certificate is approved.
