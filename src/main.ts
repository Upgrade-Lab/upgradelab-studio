import "./style.css";
import "./site.css";
import { startRouter } from "./router.ts";
import { buildShell } from "./shell.ts";

const root = document.getElementById("root")!;
const shell = buildShell(root);
startRouter(shell.main, (p) => shell.setCurrent(p), root);
