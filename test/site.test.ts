import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { settle, waitFor, allReportFiles } from "./helpers.ts";
import { INVARIANT_EXPLANATIONS } from "../src/explanations.ts";

async function boot(path: string) {
  document.body.innerHTML = '<div id="root"></div>';
  history.replaceState(null, "", path);
  vi.resetModules();
  window.scrollTo = (() => {}) as typeof window.scrollTo;
  await import("../src/main.ts");
}

const click = (a: Element) => a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));

describe("router", () => {
  beforeEach(() => document.body.replaceChildren());

  const routes: Array<[string, RegExp, string]> = [
    ["/", /^UpgradeLab$/, "Rehearse a Soroban upgrade · UpgradeLab"],
    ["/app", /report viewer/, "Report viewer · UpgradeLab"],
    ["/docs", /^Docs$/, "Docs · UpgradeLab"],
    ["/about", /About UpgradeLab/, "About · UpgradeLab"],
    ["/privacy", /Privacy policy/, "Privacy · UpgradeLab"],
    ["/terms", /Terms of use/, "Terms · UpgradeLab"],
    ["/invariants", /^Invariants$/, "Invariants · UpgradeLab"],
    ["/migrations", /^Migrations$/, "Migrations · UpgradeLab"],
  ];
  for (const [path, h1, title] of routes) {
    it(`renders ${path} with its h1, title and a current nav item`, async () => {
      await boot(path);
      expect(document.querySelectorAll("main h1").length).toBe(1);
      expect(document.querySelector("main h1")!.textContent).toMatch(h1);
      expect(document.title).toBe(title);
      expect(document.querySelector('meta[name="description"]')).not.toBeNull();
      expect(document.querySelector('[aria-current="page"]')!.getAttribute("href")).toBe(path);
      expect(document.querySelector("header")).not.toBeNull();
      expect(document.querySelector("footer")).not.toBeNull();
      await settle();
    });
  }

  it("renders the 404 page inside the shell for unknown paths", async () => {
    await boot("/nope/never");
    expect(document.querySelector("main h1")!.textContent).toBe("Page not found");
    expect(document.querySelector("header")).not.toBeNull();
    expect(document.querySelector('main a[href="/"]')).not.toBeNull();
    expect(document.querySelector('main a[href="/app"]')).not.toBeNull();
    expect(document.querySelector("[aria-current]")).toBeNull();
  });

  it("does not reload on internal link clicks, moves focus to the h1 and supports back", async () => {
    await boot("/");
    const marker = document.getElementById("root")!;
    const link = document.querySelector('header a[href="/docs"]')!;
    const notPrevented = click(link);
    expect(notPrevented).toBe(false);
    expect(location.pathname).toBe("/docs");
    expect(document.getElementById("root")).toBe(marker);
    expect(document.activeElement).toBe(document.querySelector("main h1"));
    expect(document.querySelector('nav [aria-current="page"]')!.getAttribute("href")).toBe("/docs");
    history.back();
    await new Promise((r) => setTimeout(r, 50));
    expect(document.querySelector("main h1")!.textContent).toBe("UpgradeLab");
  });

  it("has a skip link to the main landmark", async () => {
    await boot("/");
    const skip = document.querySelector("a.skip")!;
    expect(skip.getAttribute("href")).toBe("#main");
    expect(document.getElementById("main")!.tagName).toBe("MAIN");
  });
});

describe("shell", () => {
  it("the menu button toggles aria-expanded and the nav", async () => {
    await boot("/");
    const btn = document.querySelector(".menu-btn")!;
    const nav = document.getElementById("site-nav")!;
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
    expect(nav.classList.contains("open")).toBe(true);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(btn.getAttribute("aria-expanded")).toBe("false");
  });
  it("footer carries the package version and legal links", async () => {
    await boot("/");
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    expect(document.querySelector("footer")!.textContent).toContain(`version ${pkg.version}`);
    expect(document.querySelector('footer a[href="/privacy"]')).not.toBeNull();
    expect(document.querySelector('footer a[href="/terms"]')).not.toBeNull();
  });
});

describe("legal pages", () => {
  it("privacy and terms carry the dated heading", async () => {
    await boot("/privacy");
    expect(document.querySelector("main h1")!.textContent).toContain("22 October 2026");
    await boot("/terms");
    expect(document.querySelector("main h1")!.textContent).toContain("22 October 2026");
  });
});

describe("CSP", () => {
  it("index.html meta policy matches vercel.json (meta cannot carry frame-ancestors)", () => {
    const html = readFileSync("index.html", "utf8");
    const meta = /http-equiv="Content-Security-Policy" content="([^"]+)"/.exec(html)![1]!;
    const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
    const header = vercel.headers[0].headers.find((x: { key: string }) => x.key === "Content-Security-Policy").value as string;
    expect(header.replace(/; frame-ancestors 'none'$/, "")).toBe(meta);
    expect(meta).toContain("connect-src 'self';");
    expect(meta).not.toMatch(/unsafe-/);
  });
  it("vercel.json rewrites unknown paths to the SPA shell and keeps the static files out", () => {
    const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
    expect(vercel.rewrites[0].destination).toBe("/index.html");
    for (const f of ["assets/", "favicon", "og-image", "robots.txt", "sitemap.xml"]) expect(vercel.rewrites[0].source).toContain(f);
  });
});

describe("app deep links", () => {
  beforeEach(() => document.body.replaceChildren());
  it("/app?report=<file> shows one bundled report", async () => {
    await boot("/app?report=vault-correct.report.json");
    await waitFor("section.report");
    expect(document.querySelector(".compare")).toBeNull();
    expect(document.querySelector("section.report")!.getAttribute("data-verdict")).toBe("pass");
    expect((document.getElementById("pick-a") as HTMLSelectElement).value).toBe("vault-correct.report.json");
  });
  it("/app?compare=a,b shows the comparison", async () => {
    await boot("/app?compare=vault-broken-reinit.report.json,vault-correct.report.json");
    await waitFor(".compare");
    const badges = [...document.querySelectorAll(".pair.heads .badge")].map((b) => b.getAttribute("data-status"));
    expect(badges).toEqual(["fail", "pass"]);
    expect(document.getElementById("error")).toBeNull();
  });
  it("rejects names that are not bundled and falls back to the default comparison", async () => {
    await boot("/app?report=../../etc/passwd");
    await waitFor(".compare");
    expect(document.getElementById("error")!.textContent).toMatch(/not name a bundled report/);
    await boot("/app?compare=vault-correct.report.json,evil.json");
    await waitFor(".compare");
    expect(document.getElementById("error")!.textContent).toMatch(/two bundled reports/);
  });
});

describe("invariants and migrations pages", () => {
  beforeEach(() => document.body.replaceChildren());
  it("explains every invariant id found in the bundled reports", async () => {
    const { buildInvariantIndex } = await import("../src/reports.ts");
    const idx = await buildInvariantIndex();
    expect(idx.length).toBeGreaterThan(15);
    for (const e of idx) expect(INVARIANT_EXPLANATIONS[e.id], `no explanation for ${e.id}`).toBeTruthy();
    expect(allReportFiles().length).toBe(8);
  });
  it("derives which broken migration each invariant caught from the report data", async () => {
    await boot("/invariants");
    await waitFor("[data-invariant]");
    const card = (id: string) => document.querySelector(`li[data-invariant="${id}"]`)!;
    const hrefs = (id: string) => [...card(id).querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs("migration-idempotent")).toEqual(["/app?compare=vault-broken-not-idempotent.report.json,vault-correct.report.json"]);
    expect(hrefs("unauthorized-upgrade-rejected-no-auth")).toEqual(["/app?compare=vault-broken-upgrade-auth.report.json,vault-correct.report.json"]);
    expect(hrefs("reinitialize-rejected")).toEqual(["/app?compare=vault-broken-reinit.report.json,vault-correct.report.json"]);
    expect(hrefs("supply-equals-sum-after-migration").length).toBe(2);
    expect(hrefs("admin-unchanged-across-upgrade")).toEqual([]);
  });
  it("lists the correct migration and the five broken ones with links", async () => {
    await boot("/migrations");
    expect(document.querySelectorAll("li.card").length).toBe(6);
    expect(document.querySelectorAll('li.card a[href^="/app?compare="]').length).toBe(5);
  });
  it("shows the explanation inside the viewer and still renders unknown ids", async () => {
    await boot("/app?report=vault-broken-lose-balance.report.json");
    await waitFor(".inv-explain");
    expect(document.querySelector('[data-invariant="migration-idempotent"] .inv-explain')!.textContent).toMatch(/second time/);
  });
});

describe("landing", () => {
  it("renders the recorded example from the bundled reports and the install snippet", async () => {
    await boot("/");
    await waitFor(".ex-fails");
    expect(document.querySelector(".ex-fails")!.textContent).toContain("seeded-balances-preserved-after-migration");
    expect(document.body.textContent).toContain("cargo install upgradelab-runner");
    expect(document.body.textContent).toContain("upgradelab run scenarios/vault-correct.json");
  });
  it("makes no network request", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    await boot("/");
    await settle();
    expect(f).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
  it("uses none of the banned words or a sparkles icon", async () => {
    const { readdirSync } = await import("node:fs");
    const files = ["src/content.ts", "src/explanations.ts", "src/shell.ts", ...readdirSync("src/pages").map((n) => `src/pages/${n}`)];
    for (const f of files) {
      const t = readFileSync(f, "utf8").toLowerCase();
      for (const w of ["seamless", "robust", "powerful", "revolutioniz", "cutting-edge", "leverage", "unlock", "empower", "game-changer", "next-generation", "world-class", "best-in-class", "sparkle", "twinkle"]) expect(t.includes(w), `${f} has ${w}`).toBe(false);
    }
  });
});
