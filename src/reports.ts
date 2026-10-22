import { validateReport, type LoadResult } from "./validate.ts";
import type { InvariantResult, Report } from "./types.ts";

// Recorded reports are real runner output, vendored with a version stamp (see vendor/upgradelab-runner/VERSION.json).
const files = import.meta.glob("../vendor/upgradelab-runner/reports/*.report.json", { import: "default" }) as Record<string, () => Promise<unknown>>;

export const LABELS: Record<string, string> = {
  "vault-correct.report.json": "Corrected migration (in-process host)",
  "vault-broken-lose-balance.report.json": "Broken: loses a balance",
  "vault-broken-double-balance.report.json": "Broken: doubles a balance",
  "vault-broken-reinit.report.json": "Broken: unguarded re-initialization",
  "vault-broken-upgrade-auth.report.json": "Broken: unauthorized upgrade path",
  "vault-broken-not-idempotent.report.json": "Broken: migration not idempotent",
  "vault-correct.testnet.report.json": "Corrected path on Stellar testnet",
  "rerun-2026-10-08.report.json": "Corrected path on Stellar testnet (second recording, 2026-10-08)",
};

export const CORRECT_REPORT = "vault-correct.report.json";
export const BROKEN_REPORTS = [
  "vault-broken-lose-balance.report.json",
  "vault-broken-double-balance.report.json",
  "vault-broken-reinit.report.json",
  "vault-broken-upgrade-auth.report.json",
  "vault-broken-not-idempotent.report.json",
] as const;

/** Bundled report file names, in display order. */
export const recorded: string[] = Object.keys(files)
  .map((path) => path.split("/").pop()!)
  .sort((x, y) => Object.keys(LABELS).indexOf(x) - Object.keys(LABELS).indexOf(y));

export function isBundled(name: string | null | undefined): name is string {
  return !!name && recorded.includes(name);
}

export interface Loaded {
  report: Report;
  notes: string[];
  label: string;
}

export async function loadRecorded(name: string): Promise<Loaded | string> {
  const key = Object.keys(files).find((p) => p.endsWith(`/${name}`));
  if (!key) return `Unknown recorded report ${name}`;
  const r: LoadResult = validateReport(await files[key]!());
  return r.ok ? { report: r.report, notes: r.notes, label: LABELS[name] ?? name } : r.error;
}

export function compareUrl(broken: string, correct: string = CORRECT_REPORT): string {
  return `/app?compare=${broken},${correct}`;
}

export interface InvariantIndexEntry {
  id: string;
  title: string;
  kind: string;
  category: string;
  builtin: boolean;
  /** Per bundled report: the recorded status of this invariant, or absent if the report does not contain it. */
  statuses: Record<string, InvariantResult["status"]>;
  /** Broken-migration reports in which this invariant is recorded as failing. */
  caughtBy: string[];
}

/** Derives the invariant index from the bundled report data. Nothing here is hand-written. */
export async function buildInvariantIndex(): Promise<InvariantIndexEntry[]> {
  const map = new Map<string, InvariantIndexEntry>();
  for (const name of recorded) {
    const l = await loadRecorded(name);
    if (typeof l === "string") continue;
    for (const inv of l.report.invariants) {
      let e = map.get(inv.id);
      if (!e) {
        e = { id: inv.id, title: inv.title, kind: inv.kind, category: inv.category, builtin: inv.builtin, statuses: {}, caughtBy: [] };
        map.set(inv.id, e);
      }
      e.statuses[name] = inv.status;
      if ((BROKEN_REPORTS as readonly string[]).includes(name) && inv.status === "fail") e.caughtBy.push(name);
    }
  }
  return [...map.values()];
}
