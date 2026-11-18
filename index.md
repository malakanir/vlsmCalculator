---
layout: default
title: VLSM Calculator
---

<div class="app" markdown="0">
  <h1>VLSM Calculator</h1>
  <p class="lead">
    Split a base IPv4 network into subnets of different sizes (Variable Length Subnet Mask).
    Enter the base network and the hosts each subnet needs. Each subnet gets the smallest block
    that fits, and the leftover space is listed as free blocks.
  </p>

  <form id="vlsm-form">
    <div class="fields">
      <div class="field">
        <label for="vlsm-address">IP Address</label>
        <input
          id="vlsm-address"
          name="address"
          type="text"
          autocomplete="off"
          spellcheck="false"
          inputmode="decimal"
          placeholder="192.168.1.0"
        />
      </div>
      <div class="field">
        <label for="vlsm-mask">Subnet Mask</label>
        <input
          id="vlsm-mask"
          name="mask"
          type="text"
          autocomplete="off"
          spellcheck="false"
          placeholder="255.255.255.0 or /24"
        />
      </div>
      <div class="field wide">
        <label for="vlsm-cidr">CIDR: <span id="vlsm-cidr-value">/24</span></label>
        <input id="vlsm-cidr" name="cidr" type="range" min="0" max="32" step="1" value="24" />
      </div>
      <div class="field wide">
        <label for="vlsm-hosts">Hosts per Subnet (comma-separated)</label>
        <input
          id="vlsm-hosts"
          name="hosts"
          type="text"
          autocomplete="off"
          spellcheck="false"
          inputmode="numeric"
          placeholder="100, 50, 25"
        />
      </div>
    </div>

    <div class="actions">
      <button type="submit" id="vlsm-calculate">Calculate</button>
      <button type="button" id="vlsm-clear">Clear All</button>
    </div>
  </form>

  <section id="vlsm-output" aria-live="polite"></section>

  <section class="guide">
    <h2>How to Use the VLSM Calculator</h2>
    <ol>
      <li>Enter the base network: an IP address and a subnet mask or CIDR prefix.</li>
      <li>Enter the usable hosts each subnet needs, separated by commas, for example <code>100, 50</code>.</li>
      <li>Press <strong>Calculate</strong>. Results also update as you type.</li>
      <li>Review the subnets, then the free blocks, which are the space left over.</li>
    </ol>

    <h2>Example Calculation</h2>
    <p>
      For <code>192.168.1.0/24</code> with 100 and 50 hosts, Subnet 1 is <code>192.168.1.0/25</code>
      (126 usable hosts) and Subnet 2 is <code>192.168.1.128/26</code> (62 usable hosts). Subnet 1 is
      placed first because it is the largest. The remaining space,
      <code>192.168.1.192/26</code>, is listed as a free block.
    </p>
  </section>
</div>
