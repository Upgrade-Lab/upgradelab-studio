import pairing from "../../vendor/upgradelab-runner/VERSION.json";
import { h } from "../dom.ts";
import { parseReportText, TESTED_RUNNER } from "../validate.ts";
import { renderCompare, renderReport } from "../view.ts";
import { CORRECT_REPORT, LABELS, isBundled, loadRecorded, recorded, type Loaded } from "../reports.ts";

interface State {
  a: Loaded | null;
  b: Loaded | null;
  error: string | null;
  checkpoint: string;
  ready: boolean;
}

/** Which bundled reports the URL asks for. Names are checked against the bundled list; anything else is rejected. */
export function parseSelection(search: string): { a: string; b: string | null; error: string | null } {
  const q = new URLSearchParams(search);
  const report = q.get("report");
  const compare = q.get("compare");
  if (compare !== null) {
    const parts = compare.split(",");
    if (parts.length === 2 && isBundled(parts[0]) && isBundled(parts[1])) return { a: parts[0], b: parts[1], error: null };
    return { a: "vault-broken-lose-balance.report.json", b: CORRECT_REPORT, error: "The compare link does not name two bundled reports. Showing the default comparison." };
  }
  if (report !== null) {
    if (isBundled(report)) return { a: report, b: null, error: null };
    return { a: "vault-broken-lose-balance.report.json", b: CORRECT_REPORT, error: "The report link does not name a bundled report. Showing the default comparison." };
  }
  return { a: "vault-broken-lose-balance.report.json", b: CORRECT_REPORT, error: null };
}

function syncUrl(state: State): void {
  const known = (l: Loaded | null) => recorded.find((n) => (LABELS[n] ?? n) === l?.label);
  const a = known(state.a);
  const b = known(state.b);
  let q = "";
  if (a && b) q = `?compare=${a},${b}`;
  else if (a && !state.b) q = `?report=${a}`;
  try {
    history.replaceState(history.state, "", `${location.pathname}${q}`);
  } catch {
    /* replaceState can be unavailable; the URL is a convenience only */
  }
}

/** Mounts the report viewer into `root`. `search` is the query string of the /app URL. */
export function mountApp(root: HTMLElement, search = "", opts: { syncUrl?: boolean } = {}): void {
  const state: State = { a: null, b: null, error: null, checkpoint: "after:p-migrate-rest", ready: false };

  function render(): void {
    root.replaceChildren();
    const optionsFor = (withNone: boolean) => [
      ...(withNone ? [h("option", { value: "" }, "None (single report)")] : []),
      ...recorded.map((n) => h("option", { value: n }, LABELS[n] ?? n)),
    ];
    const selA = h("select", { id: "pick-a", "aria-label": "Report A" }, ...optionsFor(false));
    const selB = h("select", { id: "pick-b", "aria-label": "Compare with" }, ...optionsFor(true));
    const known = (l: Loaded | null) => recorded.find((n) => (LABELS[n] ?? n) === l?.label) ?? "";
    selA.value = known(state.a) || recorded[0] || "";
    selB.value = known(state.b);
    const changed = () => {
      if (opts.syncUrl) syncUrl(state);
      render();
    };
    selA.addEventListener("change", async () => {
      const r = await loadRecorded(selA.value);
      typeof r === "string" ? (state.error = r) : ((state.a = r), (state.error = null));
      changed();
    });
    selB.addEventListener("change", async () => {
      if (!selB.value) state.b = null;
      else {
        const r = await loadRecorded(selB.value);
        typeof r === "string" ? (state.error = r) : ((state.b = r), (state.error = null));
      }
      changed();
    });

    const file = h("input", { id: "file", type: "file", accept: "application/json,.json", "aria-label": "Open a report JSON file from your computer" });
    file.addEventListener("change", async () => {
      const f = file.files?.[0];
      if (!f) return;
      const r = parseReportText(await f.text());
      if (r.ok) {
        state.a = { report: r.report, notes: r.notes, label: f.name };
        state.b = null;
        state.error = null;
      } else state.error = r.error;
      changed();
    });

    root.append(
      h("h1", {}, "UpgradeLab report viewer"),
      h("p", { class: "tag" }, "Rehearse the upgrade using the state your application depends on. This page only displays reports that the UpgradeLab runner generated; it never runs contract code or user code."),
      h(
        "p",
        { class: "boundary" },
        "Every report here is real runner output, not a mock-up. Two execution categories exist and are never merged: ",
        h("strong", {}, "compiled WASM in an in-process Soroban host"),
        " (not a network) and ",
        h("strong", {}, "Stellar testnet"),
        ". A pass means the named invariants held in that scenario; it is not an audit and not proof of safety.",
      ),
      h("p", { class: "small muted" }, `Reads report version ${TESTED_RUNNER.reportVersion} from ${pairing.package} ${pairing.version} (commit ${pairing.commit.slice(0, 10)}). Reports from other runner versions are validated against the same schema and flagged.`),
      h("div", { class: "controls" }, h("label", { for: "pick-a" }, "Report"), selA, h("label", { for: "pick-b" }, "Compare with"), selB, h("label", { for: "file" }, "or open a file"), file),
    );
    if (state.error) root.append(h("p", { class: "error", role: "alert", id: "error" }, state.error));
    if (!state.ready) {
      root.append(h("p", { class: "empty" }, "Loading recorded reports…"));
      return;
    }
    const onCp = (n: string) => {
      state.checkpoint = n;
      render();
    };
    if (state.a && state.b) {
      root.append(renderCompare(state.a.report, state.b.report, state.a.label, state.b.label, state.checkpoint, onCp));
    } else if (state.a) {
      root.append(renderReport(state.a.report, state.a.notes, onCp, state.checkpoint));
    } else {
      root.append(h("p", { class: "empty" }, "Choose a recorded report or open one of your own."));
    }
  }

  async function boot(): Promise<void> {
    render();
    const sel = parseSelection(search);
    const a = await loadRecorded(sel.a);
    const b = sel.b ? await loadRecorded(sel.b) : null;
    if (typeof a === "string") state.error = a;
    else state.a = a;
    if (typeof b === "string") state.error = b;
    else state.b = b;
    if (sel.error && !state.error) state.error = sel.error;
    state.ready = true;
    render();
  }

  void boot();
}
