import { h } from "../dom.ts";
import { LINKS } from "../content.ts";
import { BROKEN_REPORTS, CORRECT_REPORT, compareUrl, loadRecorded } from "../reports.ts";
import { buttonLink, copyBlock, link, section } from "../ui.ts";
import type { Page } from "./types.ts";

function example(): HTMLElement {
  const box = h("div", { class: "example", "aria-live": "polite" }, h("p", { class: "muted" }, "Loading the recorded reports…"));
  void (async () => {
    const broken = await loadRecorded(BROKEN_REPORTS[0]);
    const good = await loadRecorded(CORRECT_REPORT);
    box.replaceChildren();
    if (typeof broken === "string" || typeof good === "string") {
      box.append(h("p", { class: "error", role: "alert" }, "A recorded report could not be loaded. Open the app to see the error."));
      return;
    }
    const verdict = (l: typeof broken, name: string) =>
      h("div", { class: "ex-col" }, h("h3", {}, name), h("p", {}, h("span", { class: `badge ${l.report.verdict.status}`, "data-status": l.report.verdict.status }, l.report.verdict.status.toUpperCase()), ` ${l.report.verdict.passed} passed, ${l.report.verdict.failed} failed, ${l.report.verdict.inconclusive} inconclusive`));
    const failing = broken.report.invariants.filter((i) => i.status === "fail");
    box.append(
      h("div", { class: "ex-pair" }, verdict(broken, "Broken: loses a balance"), verdict(good, "Corrected migration")),
      h("p", { class: "small muted" }, "Failing invariants in the broken run, as the runner recorded them:"),
      h("ul", { class: "ex-fails" }, ...failing.map((i) => h("li", {}, h("code", {}, i.id), h("span", {}, i.summary)))),
      h("p", { class: "small muted" }, `Both reports ran in the ${broken.report.categories.filter((c) => c.status === "executed").map((c) => c.id).join(", ")} category: compiled WASM in an in-process Soroban host, not a network.`),
      h("p", {}, link(compareUrl(BROKEN_REPORTS[0]), "Open this comparison in the app")),
    );
  })();
  return box;
}

const page: Page = {
  title: "Rehearse a Soroban upgrade",
  description: "Rehearse a Soroban contract upgrade before it touches real state. Run old and new WASM, migrate, and read named invariants with the values compared.",
  render() {
    const hero = h(
      "section",
      { class: "hero", "aria-labelledby": "hero-h" },
      h(
        "div",
        { class: "container" },
        h("h1", { id: "hero-h" }, "UpgradeLab"),
        h("p", { class: "lead" }, "Rehearse a Soroban contract upgrade before it touches real state."),
        h("p", { class: "hero-desc" }, "The runner executes the compiled old and new WASM in the Soroban host, applies your seed operations, performs the upgrade, runs your migration and evaluates named invariants. This app shows the reports it writes: each invariant, the values compared and the operation timeline."),
        h("p", { class: "cta" }, buttonLink("/app", "Open the app", "primary"), buttonLink("/docs", "Read the docs", "secondary")),
        h("p", { class: "small hero-note" }, "Soroban host, in-process · two recorded Stellar testnet runs · in-process reports replay byte for byte"),
      ),
    );

    const problem = section(
      "problem",
      "The problem",
      h("p", {}, "A Soroban migration can compile, pass its own unit tests and still lose a balance, double one, let anyone call initialize again, or leave the upgrade function unguarded."),
      h("p", {}, "Soroban contract state lives in persistent and instance storage. After an upgrade, entries written by the old code can sit next to entries in the new format until a migration converts them. A test has to build that mixed state on purpose."),
      h("p", {}, "Rehearsing the real upgrade on the real compiled code, with state you seeded yourself, finds these defects before a live contract is touched."),
    );

    const steps = section(
      "how",
      "How it works",
      h(
        "ol",
        { class: "steps" },
        h("li", {}, h("strong", {}, "Write a scenario. "), "A JSON file with named accounts, seed operations on the old WASM, exactly one upgrade operation, post-upgrade operations, probes and invariants."),
        h("li", {}, h("strong", {}, "Run it. "), "The runner executes both compiled WASM files in the Soroban host, signs real authorization entries, calls update_current_contract_wasm and then your migration calls."),
        h("li", {}, h("strong", {}, "Read the report. "), "It lists every invariant with the values compared, every executed operation, and which execution category produced each result."),
        h("li", {}, h("strong", {}, "Open it here. "), "The app validates the report against the v1 schema and lets you compare a broken run with a corrected one, checkpoint by checkpoint."),
      ),
    );

    const caps = section(
      "checks",
      "What you get",
      h(
        "ul",
        { class: "grid" },
        h("li", {}, h("h3", {}, "Named invariants with evidence"), h("p", {}, "Every invariant has an id, a status and the values it compared, such as \"balance-dave is 0 but expected 40\".")),
        h("li", {}, h("h3", {}, "Mixed-format state"), h("p", {}, "Raw-storage shape checks show that old and new entries really coexist during the run.")),
        h("li", {}, h("h3", {}, "Repeated migration"), h("p", {}, "migration-idempotent calls migrate again and compares balances, supply, admin, holders and raw storage.")),
        h("li", {}, h("h3", {}, "Authorization on upgrade"), h("p", {}, "Three unauthorized upgrade attempts are made and must be rejected by the host. Authorization is enforced, not mocked.")),
        h("li", {}, h("h3", {}, "Categories never merged"), h("p", {}, "Compiled WASM in-process, testnet RPC and native SDK tests are labeled separately and never combined into one verdict.")),
        h("li", {}, h("h3", {}, "Replayable reports"), h("p", {}, "upgradelab replay re-runs the scenario embedded in a report and says REPRODUCED or DIFFERENT. Testnet reports are not replayable.")),
      ),
    );

    const ex = section("example", "A recorded example", h("p", {}, "These are real reports from the vault fixture, loaded from this site's bundled files. Nothing on this card is typed in by hand."), example());

    const stellar = section(
      "stellar",
      "Built on Stellar",
      h(
        "ul",
        { class: "plain" },
        h("li", {}, h("code", {}, "update_current_contract_wasm"), ": the real upgrade call. The report records the executable hash after each operation."),
        h("li", {}, "Persistent versus instance storage: the vault keeps balances in persistent entries and a schema version in instance storage, with old and new formats side by side."),
        h("li", {}, h("code", {}, "require_auth"), " on upgrade: the runner signs authorization entries with ed25519 and installs them, so a missing or wrong signature fails in the host."),
        h("li", {}, "Soroban host execution: soroban-sdk 28.0.0 with the test utilities, running the compiled WASM in-process. It is not a network."),
        h("li", {}, "Two recorded testnet runs: real transactions on Stellar testnet, 12 each, both with a PASS verdict of 14 invariants. Testnet results say nothing about mainnet."),
      ),
    );

    const stack = section(
      "stack",
      "Use it in your stack",
      h("p", {}, "The runner is a Rust command-line tool published on crates.io. The binary is called upgradelab."),
      copyBlock("install command", "cargo install upgradelab-runner"),
      copyBlock("run command", "upgradelab run scenarios/vault-correct.json"),
      h("p", { class: "small muted" }, "The scenarios and the fixture WASM are in the runner repository, so run this from a clone of it. Add --format json --out report.json to write a report you can open in the app."),
    );

    const limits = section(
      "limits",
      "What it does not do",
      h(
        "ul",
        { class: "plain" },
        h("li", {}, "It does not clone live ledger state or discover storage keys. State comes from your seed operations."),
        h("li", {}, "It makes no claim about exhaustive checking. A pass means the named invariants held in that scenario in that host."),
        h("li", {}, "It does not model fees, network resource limits, or state archival. The host protocol (28) can differ from the live network."),
        h("li", {}, "It is not a static analyzer and not a test library."),
        h("li", {}, "The vault is a teaching fixture, not an audited contract. No contract-security expert has reviewed the invariants."),
        h("li", {}, "This app never runs contract code. It only displays reports."),
      ),
    );

    const oss = section(
      "oss",
      "Open source",
      h("p", {}, "UpgradeLab is MIT licensed and developed in the open. The runner and this app are separate repositories."),
      h(
        "ul",
        { class: "plain" },
        h("li", {}, link(LINKS.runnerRepo, "upgradelab-runner"), " (Rust core)"),
        h("li", {}, link(LINKS.studioRepo, "upgradelab-studio"), " (this app)"),
        h("li", {}, link(LINKS.goodFirst, "Good first issues")),
        h("li", {}, link(LINKS.contributing, "CONTRIBUTING.md")),
        h("li", {}, link(LINKS.discussions, "Discussions")),
      ),
    );

    const root = h("div", {});
    root.append(hero, problem, steps, caps, ex, stellar, stack, limits, oss);
    return root;
  },
};
export default page;
