import { version } from "../package.json";
import { h } from "./dom.ts";
import { LINKS } from "./content.ts";
import { PROJECT } from "./router.ts";
import { link, logoMark } from "./ui.ts";

const NAV: Array<[string, string]> = [
  ["/", "Product"],
  ["/app", "App"],
  ["/invariants", "Invariants"],
  ["/migrations", "Migrations"],
  ["/docs", "Docs"],
  ["/about", "About"],
];

export interface Shell {
  main: HTMLElement;
  setCurrent(path: string): void;
}

/** Builds skip link, header with nav, main landmark and footer into `root`. */
export function buildShell(root: HTMLElement): Shell {
  const navList = h("ul", { class: "nav-list" });
  for (const [href, text] of NAV) navList.append(h("li", {}, h("a", { href }, text)));
  navList.append(h("li", {}, link(LINKS.studioRepo, "GitHub")));

  const nav = h("nav", { id: "site-nav", class: "site-nav", "aria-label": "Main" }, navList);
  const toggle = h("button", { type: "button", class: "menu-btn", "aria-expanded": "false", "aria-controls": "site-nav" }, "Menu");
  const setOpen = (open: boolean) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => {
    if ((e.target as Element).closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });

  const header = h(
    "header",
    { class: "site-header" },
    h("div", { class: "container bar" }, h("a", { href: "/", class: "brand" }, logoMark(28), h("span", {}, PROJECT)), toggle, nav),
  );

  const main = h("main", { id: "main" });

  const col = (title: string, ...items: HTMLElement[]) => h("div", { class: "fcol" }, h("h2", {}, title), h("ul", {}, ...items.map((i) => h("li", {}, i))));
  const footer = h(
    "footer",
    { class: "site-footer" },
    h(
      "div",
      { class: "container" },
      h(
        "div",
        { class: "fcols" },
        col("Product", link("/app", "App"), link("/docs", "Docs"), link("/about", "About"), link("/invariants", "Invariants"), link("/migrations", "Migrations")),
        col("Open source", link(LINKS.runnerRepo, "Runner repository"), link(LINKS.studioRepo, "App repository"), link(LINKS.issues, "Issues"), link(LINKS.discussions, "Discussions"), link(LINKS.crate, "upgradelab-runner on crates.io")),
        col("Documentation", link(LINKS.runnerDocs, "Runner docs"), link(LINKS.studioDocs, "App docs")),
        col("Legal", link("/privacy", "Privacy"), link("/terms", "Terms"), link(LINKS.license, "MIT License")),
      ),
      h("p", { class: "small muted fbottom" }, `MIT licensed · version ${version} · Built for the Stellar network`),
    ),
  );

  root.replaceChildren(h("a", { class: "skip", href: "#main" }, "Skip to content"), header, main, footer);
  // The skip link targets #main, which is not focusable by default.
  main.setAttribute("tabindex", "-1");

  return {
    main,
    setCurrent(path: string) {
      for (const a of root.querySelectorAll(".nav-list a, footer a")) {
        if (a.getAttribute("href") === path) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      }
    },
  };
}
