/**
 * Plain-language explanations of the invariant ids found in the bundled reports. The wording comes from the
 * titles the runner wrote into the reports and the vault scenario in upgradelab-runner (scenarios/vault-correct.json).
 * A test fails when a bundled report contains an id that is missing here; unknown ids still render without a note.
 */
export const INVARIANT_EXPLANATIONS: Record<string, string> = {
  "seed-operations-succeeded": "Built in. The calls that set up the starting state on the old contract all went through. If they did not, the rest of the run has no meaningful starting point.",
  "upgrade-applied": "Built in. The upgrade call ran and the contract's executable changed from the old WASM to the new WASM.",
  "post-upgrade-operations-succeeded": "Built in. The calls the scenario expects to succeed after the upgrade, including the migration calls, did succeed.",
  "balances-preserved-across-upgrade": "Right after the upgrade and before any migration, every seeded balance, the total supply and the list of holders read back exactly as they did just before it.",
  "admin-unchanged-across-upgrade": "The stored admin address is the same right after the upgrade as right before it.",
  "supply-equals-sum-after-upgrade": "Right after the upgrade, the stored total supply equals the sum of the individual balances.",
  "mixed-format-state-exercised": "Checks that the test really covers mixed-format state: one account touched after the upgrade is in the new storage format while the others are still in the old one. Without this, a pass could come from a state that is not mixed.",
  "mixed-format-balances-correct": "With old-format and new-format entries side by side, every balance reads back as the seed operations imply, not as the contract reports.",
  "partial-migration-preserves-balances": "The migration runs in batches. After only the first batch, every balance is still correct.",
  "seeded-balances-preserved-after-migration": "After the whole migration, every seeded balance equals the value the seed operations imply.",
  "supply-equals-sum-after-migration": "After the migration, the stored total supply equals the sum of the individual balances. A lost or duplicated balance breaks this.",
  "admin-unchanged-after-migration": "The stored admin address is still the same after the whole upgrade and migration.",
  "migration-converts-every-entry": "After the migration no old-format entry remains and every holder has a new-format entry. Read from raw storage, not from the contract's view functions.",
  "migration-idempotent": "Calling migrate a second time changes nothing: balances, supply, admin, holders and raw storage all read the same afterwards.",
  "unauthorized-upgrade-rejected-old-contract": "A caller with no authorization tries to upgrade the old contract. The host rejects the call and the contract's executable is unchanged.",
  "unauthorized-upgrade-rejected-no-auth": "A caller with no authorization tries to upgrade the new contract. The host rejects the call and the contract's executable is unchanged.",
  "unauthorized-upgrade-rejected-self-signed": "An account that is not the admin signs an upgrade call for the new contract. The call is rejected and the executable is unchanged.",
  "reinitialize-rejected": "A stranger calls initialize on a contract that is already initialized. The contract rejects the call.",
  "reinitialize-changes-nothing": "After that repeated initialize call, the admin, supply, holders and balances are untouched.",
};
