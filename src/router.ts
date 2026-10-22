import landing from "./pages/landing.ts";
import appPage from "./pages/app.page.ts";
import docs from "./pages/docs.ts";
import about from "./pages/about.ts";
import privacy from "./pages/privacy.ts";
import terms from "./pages/terms.ts";
import invariants from "./pages/invariants.ts";
import migrations from "./pages/migrations.ts";
import notFound from "./pages/notfound.ts";
import type { Page } from "./pages/types.ts";

export const PROJECT = "UpgradeLab";

export const ROUTES: Record<string, Page> = {
  "/": landing,
  "/app": appPage,
  "/docs": docs,
  "/about": about,
  "/privacy": privacy,
  "/terms": terms,
  "/invariants": invariants,
  "/migrations": migrations,
};

export function normalize(path: string): string {
  const p = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return p === "" ? "/" : p;
}

export function resolve(path: string): { path: string; page: Page; found: boolean } {
  const p = normalize(path);
  const page = Object.hasOwn(ROUTES, p) ? ROUTES[p] : undefined;
  return page ? { path: p, page, found: true } : { path: p, page: notFound, found: false };
}

export interface Router {
  navigate(url: string): void;
  current(): string;
}

/** Tiny History API router. Renders into `main`, sets the title and description, moves focus to the h1. */
export function startRouter(main: HTMLElement, onRoute: (path: string) => void = () => {}, linkRoot: HTMLElement | Document = document): Router {
  let current = "";

  function show(first: boolean): void {
    const { path, page, found } = resolve(location.pathname);
    current = found ? path : "";
    document.title = `${page.title} · ${PROJECT}`;
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.append(meta);
    }
    meta.content = page.description;
    main.replaceChildren(page.render({ search: location.search }));
    onRoute(current);
    if (!first) {
      const h1 = main.querySelector("h1");
      if (h1) {
        h1.setAttribute("tabindex", "-1");
        h1.focus({ preventScroll: true });
      }
      try {
        window.scrollTo(0, 0);
      } catch {
        /* not available in every environment */
      }
    }
  }

  function navigate(url: string): void {
    const u = new URL(url, location.origin);
    if (u.origin !== location.origin) return;
    if (u.pathname + u.search !== location.pathname + location.search) history.pushState(null, "", u.pathname + u.search + u.hash);
    show(false);
  }

  linkRoot.addEventListener("click", (event: Event) => {
    const e = event as MouseEvent;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target instanceof Element ? e.target.closest("a") : null;
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("/") || href.startsWith("//")) return;
    e.preventDefault();
    navigate(href);
  });
  window.addEventListener("popstate", () => show(false));

  show(true);
  return { navigate, current: () => current };
}
