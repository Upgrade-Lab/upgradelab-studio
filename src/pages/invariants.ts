import { h } from "../dom.ts";
import { INVARIANT_EXPLANATIONS } from "../explanations.ts";
import { BROKEN_REPORTS, LABELS, buildInvariantIndex, compareUrl, recorded } from "../reports.ts";
import { link } from "../ui.ts";
import type { Page } from "./types.ts";

const page: Page = {
  title: "Invariants",
  description: "Every invariant id in the bundled UpgradeLab reports, what it checks in plain words, and which broken migrations the recorded reports show it catching.",
  render() {
    const c = h("div", { class: "container prose wide" });
    const list = h("div", { "aria-live": "polite" }, h("p", { class: "muted" }, "Reading the bundled reports…"));
    c.append(
      h("h1", {}, "Invariants"),
      h("p", { class: "lead" }, "An invariant is a named check the runner evaluates over the state it reads back. This page lists every id found in the bundled reports. The \"caught\" lists are computed from those reports when the page loads: an invariant is listed for a broken migration only if that report records it as failing."),
      h("p", { class: "small muted" }, `A pass means the invariant held in that scenario in the Soroban host. It is not an audit and not proof of safety. Reports read: ${recorded.length}.`),
      list,
    );
    void (async () => {
      const idx = await buildInvariantIndex();
      list.replaceChildren();
      const ul = h("ul", { class: "cards" });
      for (const e of idx) {
        const explain = INVARIANT_EXPLANATIONS[e.id];
        const reports = Object.keys(e.statuses).length;
        ul.append(
          h(
            "li",
            { class: "card", "data-invariant": e.id },
            h("h2", {}, h("code", {}, e.id)),
            h("p", { class: "small muted" }, e.builtin ? "Built in" : `Kind: ${e.kind}`, ` · category: ${e.category} · recorded in ${reports} of ${recorded.length} reports`),
            h("p", {}, explain ?? e.title),
            e.caughtBy.length > 0
              ? h("div", {}, h("p", { class: "small" }, h("strong", {}, `Recorded as failing in ${e.caughtBy.length} of the ${BROKEN_REPORTS.length} broken migrations:`)), h("ul", { class: "plain" }, ...e.caughtBy.map((b) => h("li", {}, link(compareUrl(b), `${LABELS[b] ?? b}: compare with the corrected migration`)))))
              : h("p", { class: "small muted" }, `Not recorded as failing in any of the ${BROKEN_REPORTS.length} broken migrations.`),
          ),
        );
      }
      list.append(ul);
    })();
    return c;
  },
};
export default page;
