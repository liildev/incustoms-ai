/**
 * Where a slide claim comes from, for editing and Q&A — not shown on slides unless noted.
 * `V2 §n` → audit/INCUSTOMS-AUDIT-V2.md, `Δ §n` → audit/INCUSTOMS-AUDIT-V2-CLIENT-MODULES.md,
 * `HN §n` → audit/INCUSTOMS-AUDIT-V2-HARDENING-NOTES.md, `WT2 §n` → audit/INCUSTOMS-DEVELOPER-WALKTHROUGH-V2.md;
 * finding codes (D-10, W-11, …) are the IDs used in V2 and Δ. The spoken version of every main slide,
 * with what not to overclaim, is audit/presentation-script.md.
 */
export type AuditSource = string
