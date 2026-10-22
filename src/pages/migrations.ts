import { h } from "../dom.ts";
import { MIGRATIONS } from "../content.ts";
import { CORRECT_REPORT, compareUrl, loadRecorded } from "../reports.ts";
import { link } from "../ui.ts";
import type { Page } from "./types.ts";

const page: Page = {
  title: "Migrations",
  description: "The vault fixture: one correct migration and five deliberately broken ones, with the defect in each and links to the recorded reports.",
  render() {
    const c = h("div", { class: "container prose wide" });
    c.append(
      h("h1", {}, "Migrations"),
      h("p", { class: "lead" }, "The runner ships a toy vault contract. Version 1 stores one balance per address. Version 2 stores a new struct, reads either format, and has a batched migrate. The fixture has one correct version 2 and five that each compile in one deliberate defect."),
      h("p", { class: "small muted" }, "The vault is a teaching fixture, not an audited contract."),
    );
    const ul = h("ul", { class: "cards" });
    for (const m of MIGRATIONS) {
      const verdict = h("span", { class: "small muted" }, "");
      void loadRecorded(m.report).then((l) => {
        if (typeof l !== "string") verdict.textContent = `Recorded verdict: ${l.report.verdict.status.toUpperCase()} (${l.report.verdict.passed} passed, ${l.report.verdict.failed} failed)`;
      });
      const isCorrect = m.report === CORRECT_REPORT;
      ul.append(
        h(
          "li",
          { class: "card", "data-report": m.report },
          h("h2", {}, m.name),
          h("p", {}, m.defect),
          verdict,
          h("p", { class: "links" }, link(`/app?report=${m.report}`, "Open the report"), isCorrect ? null : link(compareUrl(m.report), "Compare with the correct migration")),
        ),
      );
    }
    c.append(ul, h("h2", {}, "Testnet recordings"), h("p", {}, "The corrected path was also run on Stellar testnet twice. These runs are a different execution category and are not merged with the in-process reports."), h("p", { class: "links" }, link("/app?report=vault-correct.testnet.report.json", "First testnet run"), link("/app?report=rerun-2026-10-08.report.json", "Second testnet run (2026-10-08)")));
    return c;
  },
};
export default page;
