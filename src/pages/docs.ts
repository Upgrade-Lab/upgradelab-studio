import { h } from "../dom.ts";
import { LINKS } from "../content.ts";
import { copyBlock, link } from "../ui.ts";
import type { Page } from "./types.ts";

const page: Page = {
  title: "Docs",
  description: "Get started with UpgradeLab: install the runner, run the vault scenarios, and open the reports in the app.",
  render() {
    const c = h("div", { class: "container prose" });
    c.append(
      h("h1", {}, "Docs"),
      h("p", { class: "lead" }, "Run a rehearsal with the runner, then read the report here. The full documentation for both repositories is on GitBook."),
      h("h2", {}, "What you need"),
      h(
        "ul",
        {},
        h("li", {}, "Rust, to install the runner (the runner README names Rust 1.96 stable)."),
        h("li", {}, "A clone of the runner repository, for the example scenarios and the fixture WASM."),
        h("li", {}, "A browser. This app needs no account and no install."),
      ),
      h("h2", {}, "Install the runner"),
      h("p", {}, "The runner is on ", link(LINKS.crate, "crates.io"), ". The binary is called upgradelab."),
      copyBlock("install command", "cargo install upgradelab-runner"),
      h("h2", {}, "Run a scenario"),
      h("p", {}, "Scenario WASM paths are relative to --root (default: the current directory), so run these from a clone of ", link(LINKS.runnerRepo, "upgradelab-runner"), "."),
      copyBlock(
        "commands from the runner README",
        [
          "git clone https://github.com/Upgrade-Lab/upgradelab-runner && cd upgradelab-runner",
          "upgradelab run scenarios/vault-correct.json",
          "upgradelab run scenarios/vault-broken-lose-balance.json --format json --out report.json",
          "upgradelab replay report.json",
          "upgradelab check-report report.json",
        ].join("\n"),
      ),
      h("p", {}, "Exit codes: 0 every invariant passed, 1 an invariant failed (or replay differed), 2 invalid input, 3 inconclusive, 4 environment error."),
      h("h2", {}, "Built-in vault checks from source"),
      h("p", {}, "The runner's current source adds a check command that embeds a vault scenario. It is not yet in the published 0.1.1 crate; build the runner checkout to use it:"),
      copyBlock("built-in vault checks", "cargo run -- check --out vault-report.json\ncargo run -- check --old-wasm artifacts/old.wasm --new-wasm artifacts/new.wasm --checks balance-conservation,reinitialization,unauthorized-upgrade,migration-state\ncargo run -- replay vault-report.json"),
      h("p", {}, "The built-in pack assumes the fixture vault interface and storage keys. It runs compiled WASM with seeded local state; it does not read live balances or discover arbitrary contract interfaces. Use a custom scenario for other contracts."),
      h("p", {}, "The ", link(`${LINKS.runnerRepo}/blob/main/action.yml`, "GitHub Action"), " runs the same checks. Failed, inconclusive, invalid and environment-error results fail the step. Upload its report with an always() artifact step to inspect failures."),
      h("p", {}, "The ", link(`${LINKS.runnerRepo}/tree/main/evidence/builtins`, "recorded built-in runs"), " contain the actual results for all six compiled vault fixtures: the correct migration passed 19 checks, and each of the five deliberately broken variants failed checks. These are local host observations, not network results."),
      h("h2", {}, "Load your own report in this app"),
      h("ol", {}, h("li", {}, "Write the report with --format json --out report.json."), h("li", {}, "Open ", link("/app", "the app"), " and choose the file in the \"or open a file\" control."), h("li", {}, "The app validates it against the v1 report schema. If it came from a runner version other than the one this app was tested with, it is shown with a note.")),
      h("p", {}, "The file is read in your browser. It is not uploaded."),
      h("h2", {}, "Open a bundled report by link"),
      h("p", {}, "The app accepts two query forms, for the bundled reports only:"),
      h("ul", {}, h("li", {}, h("code", {}, "/app?report=vault-correct.report.json")), h("li", {}, h("code", {}, "/app?compare=vault-broken-lose-balance.report.json,vault-correct.report.json"))),
      h("p", {}, "Names that are not bundled are rejected and the default comparison is shown. See also ", link("/invariants", "the invariants"), " and ", link("/migrations", "the migrations"), " pages."),
      h("h2", {}, "Full documentation"),
      h("ul", {}, h("li", {}, link(LINKS.runnerDocs, "upgradelab-runner documentation")), h("li", {}, link(LINKS.studioDocs, "upgradelab-studio documentation"))),
    );
    return c;
  },
};
export default page;
