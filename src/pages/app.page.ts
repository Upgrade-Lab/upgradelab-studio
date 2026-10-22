import { h } from "../dom.ts";
import { mountApp } from "./app.ts";
import type { Page } from "./types.ts";

const page: Page = {
  title: "Report viewer",
  description: "View UpgradeLab migration-rehearsal reports: invariants with evidence, operation timeline, broken versus corrected migration.",
  render({ search }) {
    const root = h("div", { class: "container viewer" });
    mountApp(root, search, { syncUrl: true });
    return root;
  },
};
export default page;
