import { h } from "./dom.ts";

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl(tag: string, attrs: Record<string, string>): SVGElement {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

/** Logo mark: an upgrade arrow with a dashed rehearsal copy behind it. Same drawing as public/favicon.svg. */
export function logoMark(size = 28): SVGElement {
  const svg = svgEl("svg", { viewBox: "0 0 32 32", width: String(size), height: String(size), "aria-hidden": "true", focusable: "false", class: "logo-mark" });
  svg.append(
    svgEl("rect", { width: "32", height: "32", rx: "7", fill: "#1e1b4b" }),
    svgEl("path", { d: "M11 23V13m0 0-3.5 3.5M11 13l3.5 3.5", fill: "none", stroke: "#a5b4fc", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": "0.1 3.2" }),
    svgEl("path", { d: "M21 25V8m0 0-6 6m6-6 6 6", fill: "none", stroke: "#ffffff", "stroke-width": "2.6", "stroke-linecap": "round", "stroke-linejoin": "round" }),
  );
  return svg;
}

const isExternal = (href: string) => /^https?:\/\//.test(href);

export function link(href: string, text: string, attrs: Record<string, string | undefined> = {}): HTMLAnchorElement {
  const a = h("a", { href, ...attrs }, text);
  if (isExternal(href)) {
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  }
  return a;
}

export function buttonLink(href: string, text: string, kind: "primary" | "secondary"): HTMLAnchorElement {
  return link(href, text, { class: `btn ${kind}` });
}

/** A code block with a copy button. The clipboard is only written when the user presses the button. */
export function copyBlock(label: string, code: string): HTMLElement {
  const status = h("span", { class: "copy-status small muted", role: "status" });
  const btn = h("button", { type: "button", class: "btn copy", "aria-label": `Copy ${label}` }, "Copy");
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code);
      status.textContent = "Copied";
    } catch {
      status.textContent = "Copy failed. Select the text and copy it by hand.";
    }
  });
  return h("div", { class: "codeblock" }, h("div", { class: "codebar" }, h("span", { class: "small muted" }, label), btn, status), h("pre", { tabindex: "0" }, h("code", {}, code)));
}

export function section(id: string, title: string, ...children: Array<Node | string | null>): HTMLElement {
  return h("section", { class: "block", "aria-labelledby": `${id}-h` }, h("div", { class: "container" }, h("h2", { id: `${id}-h` }, title), ...children));
}
