import { BROKEN_REPORTS, CORRECT_REPORT } from "./reports.ts";

export { INVARIANT_EXPLANATIONS } from "./explanations.ts";

export interface MigrationInfo {
  report: string;
  name: string;
  defect: string;
}

/** One sentence per fixture, taken from the defect comments in upgradelab-runner fixtures/contracts/vault-v2/src/lib.rs and its README table. */
export const MIGRATIONS: MigrationInfo[] = [
  { report: CORRECT_REPORT, name: "Correct migration", defect: "No defect: it reads either storage format, converts balances in batches, can be run again without changing anything, and keeps initialize and upgrade guarded." },
  { report: BROKEN_REPORTS[0], name: "Loses a balance", defect: "An off-by-one deletes the legacy entry of the last holder without ever writing its amount to the new format." },
  { report: BROKEN_REPORTS[1], name: "Doubles a balance", defect: "The legacy entry is left behind after it is copied, and the reader sums both formats, so the balance is reported twice." },
  { report: BROKEN_REPORTS[2], name: "Unguarded re-initialization", defect: "The guard on initialize is missing, so anyone can call it again, take over the admin role and wipe the accounting." },
  { report: BROKEN_REPORTS[3], name: "Unauthorized upgrade", defect: "The upgrade function reads the admin but never calls require_auth, so any account can replace the contract code." },
  { report: BROKEN_REPORTS[4], name: "Migration not idempotent", defect: "Once the migration has finished, every further migrate call bumps each account's deposits counter again; balances stay correct, so only a raw-storage comparison sees it." },
];

export const LINKS = {
  prod: "https://upgradelab-studio-anasamasama.vercel.app",
  runnerRepo: "https://github.com/Upgrade-Lab/upgradelab-runner",
  studioRepo: "https://github.com/Upgrade-Lab/upgradelab-studio",
  runnerDocs: "https://stellar-developer-tools.gitbook.io/upgradelab-runner/",
  studioDocs: "https://stellar-developer-tools.gitbook.io/upgradelab-studio/",
  crate: "https://crates.io/crates/upgradelab-runner",
  discussions: "https://github.com/Upgrade-Lab/upgradelab-studio/discussions",
  issues: "https://github.com/Upgrade-Lab/upgradelab-studio/issues",
  goodFirst: "https://github.com/Upgrade-Lab/upgradelab-studio/labels/good%20first%20issue",
  contributing: "https://github.com/Upgrade-Lab/upgradelab-studio/blob/main/CONTRIBUTING.md",
  security: "https://github.com/Upgrade-Lab/upgradelab-studio/blob/main/SECURITY.md",
  license: "https://github.com/Upgrade-Lab/upgradelab-studio/blob/main/LICENSE",
  changelog: "https://github.com/Upgrade-Lab/upgradelab-studio/blob/main/CHANGELOG.md",
  vercelPrivacy: "https://vercel.com/legal/privacy-policy",
} as const;
