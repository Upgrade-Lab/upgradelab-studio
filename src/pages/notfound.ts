import { h } from "../dom.ts";
import { link } from "../ui.ts";
import type { Page } from "./types.ts";

const page: Page = {
  title: "Page not found",
  description: "This page does not exist.",
  render() {
    return h("div", { class: "container prose" }, h("h1", {}, "Page not found"), h("p", {}, "There is nothing at this address."), h("p", {}, link("/", "Go to the home page"), " or ", link("/app", "open the app"), "."));
  },
};
export default page;
