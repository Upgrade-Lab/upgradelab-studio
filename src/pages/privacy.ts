import { h } from "../dom.ts";
import { LINKS } from "../content.ts";
import { link } from "../ui.ts";
import type { Page } from "./types.ts";

export const PRIVACY_DATE = "22 October 2026";

const page: Page = {
  title: "Privacy",
  description: "Privacy policy for the UpgradeLab app: no accounts, no cookies, no analytics, no uploads.",
  render() {
    const c = h("div", { class: "container prose" });
    c.append(
      h("h1", {}, `Privacy policy, ${PRIVACY_DATE}`),
      h("h2", {}, "Who runs this"),
      h("p", {}, "The UpgradeLab maintainers named on the ", link("/about", "About page"), ". Contact us through ", link(LINKS.issues, "issues on the GitHub repository"), ". Report security problems as described in ", link(LINKS.security, "SECURITY.md"), "."),
      h("h2", {}, "What the app does with your data"),
      h("p", {}, "Report files you open are read and checked in your browser. The app does not upload them. There are no accounts, no cookies, no analytics and no advertising. The app does not use localStorage or sessionStorage and keeps nothing after you close the tab."),
      h("h2", {}, "Network requests"),
      h("p", {}, "The app makes requests only to its own origin, to load its pages, scripts and the bundled recorded reports. The Content-Security-Policy limits connections to that origin. The app has no feature that contacts any other host."),
      h("h2", {}, "Hosting"),
      h("p", {}, "The app is served by Vercel. Vercel may process standard request data such as your IP address and user agent in its server logs, under ", link(LINKS.vercelPrivacy, "its own privacy policy"), "."),
      h("h2", {}, "Public blockchain data"),
      h("p", {}, "The recorded testnet reports contain contract IDs and transaction hashes from Stellar testnet. That is public ledger data."),
      h("h2", {}, "Changes"),
      h("p", {}, "Changes to this policy are made through the public repository, and its history is the record."),
    );
    return c;
  },
};
export default page;
