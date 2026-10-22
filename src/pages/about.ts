import { h } from "../dom.ts";
import { LINKS } from "../content.ts";
import { link } from "../ui.ts";
import { version } from "../../package.json";
import type { Page } from "./types.ts";

const page: Page = {
  title: "About",
  description: "What UpgradeLab is, why it exists, how the runner and the app fit together, who maintains it, and how to contribute.",
  render() {
    const c = h("div", { class: "container prose" });
    c.append(
      h("h1", {}, "About UpgradeLab"),
      h("h2", {}, "What it is"),
      h("p", {}, "UpgradeLab rehearses a Soroban contract upgrade. It runs the compiled old and new WASM, performs the upgrade and your migration, and judges named invariants over the state it reads back. The result is a report that records what ran and what was compared."),
      h("h2", {}, "Why it exists"),
      h("p", {}, "A migration can compile and pass its own unit tests and still lose a balance, double one, let anyone call initialize again, or leave the upgrade function unguarded. These defects show up when real upgrade steps run on seeded state, which is what the runner does."),
      h("h2", {}, "How the runner and the app fit together"),
      h("ul", {}, h("li", {}, link(LINKS.runnerRepo, "upgradelab-runner"), " is the Rust core. It writes reports and can replay them."), h("li", {}, link(LINKS.studioRepo, "upgradelab-studio"), " is this app. It vendors the runner's report schema and the recorded reports, and only displays them. It computes no verdicts.")),
      h("h2", {}, "Maintainers"),
      h("ul", {}, h("li", {}, "Anas Abubakar, lead maintainer (", link("https://github.com/Anasabubakar", "@Anasabubakar"), ")"), h("li", {}, "Abdulbasit Fazazi, co-maintainer (", link("https://github.com/fazaziishola-coder", "@fazaziishola-coder"), ")")),
      h("h2", {}, "License"),
      h("p", {}, "MIT. See the ", link(LINKS.license, "LICENSE"), "."),
      h("h2", {}, "Contribute"),
      h("p", {}, "Open issues are scoped so one person can finish one in a single cycle. Read ", link(LINKS.contributing, "CONTRIBUTING.md"), ", pick from the ", link(LINKS.issues, "issue list"), " and say you are taking it before you start. Questions go in ", link(LINKS.discussions, "Discussions"), ". Security reports go through ", link(LINKS.security, "SECURITY.md"), "."),
      h("h2", {}, "Release"),
      h("p", {}, `This app is version ${version}. The version history is in the `, link(LINKS.changelog, "changelog"), "."),
      h("h2", {}, "Status"),
      h("p", {}, "No Soroban upgrade or security reviewer has looked at the invariants the reports show."),
    );
    return c;
  },
};
export default page;
