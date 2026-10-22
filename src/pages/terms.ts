import { h } from "../dom.ts";
import { LINKS } from "../content.ts";
import { link } from "../ui.ts";
import type { Page } from "./types.ts";

export const TERMS_DATE = "22 October 2026";

const page: Page = {
  title: "Terms",
  description: "Terms of use for the UpgradeLab app: MIT licensed, provided as is, not advice and not an audit.",
  render() {
    const c = h("div", { class: "container prose" });
    c.append(
      h("h1", {}, `Terms of use, ${TERMS_DATE}`),
      h("ul", {},
        h("li", {}, "The software is open source under the MIT License. Read the ", link(LINKS.license, "LICENSE"), " in the repository."),
        h("li", {}, "It is provided as is, without warranty of any kind, as the license states."),
        h("li", {}, "It is an engineering and diagnostic tool. It is not financial, legal, investment, compliance or security advice, it is not an audit, and its results are not a guarantee of anything about a contract, payment or network."),
        h("li", {}, "Recorded reports are labeled as recordings. Testnet results say nothing about mainnet."),
        h("li", {}, "You are responsible for the report files you open."),
        h("li", {}, "There are no accounts and no fees."),
        h("li", {}, "Contact us through ", link(LINKS.issues, "issues on the GitHub repository"), "."),
      ),
    );
    return c;
  },
};
export default page;
