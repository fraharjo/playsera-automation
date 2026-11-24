# Feature: <name>

Copy this file to `requirements/<feature>.md` and fill it in. Quote acceptance criteria verbatim from the source; put your interpretation under Assumptions, not in the AC text.

## Metadata
- Jira: `@JIRA-<KEY>` (e.g. `@JIRA-WEB-101`)
- Requirement key: `@REQ-<KEY>` (e.g. `@REQ-AUTH-01`)
- Module tag: `@feature-<module>` (e.g. `@feature-auth`)
- Platform: `@web` | `@api` | `@mobile-web`
- Sources: <Jira key, Figma URLs, PRD section>
- Raw inputs: `requirements/inputs/<feature>/` (PDF, docx, Jira text, Figma mockups, manual test cases CSV)

## Source Attribution Legend
- `[AC-xx]`: Verbatim acceptance criteria from source ticket / user story.
- `[FLOW-xx]`: Step described in user journey / flow description.
- `[DESIGN-xx]` / `[SCREENSHOT-xx]`: Visual element or layout observed in mockups / screenshots.
- `[ASSUMPTION]`: Unconfirmed working technical hypothesis.
- `[DERIVED]`: Unwritten high-impact business / security risk check (max 5 per feature).

## Acceptance Criteria
| ID | Acceptance criterion (verbatim) | Source (Jira / Figma / PRD) | Type (explicit / derived) |
| :-- | :-- | :-- | :-- |
| AC-01 | ... | ... | explicit |
| AC-02 | ... | ... | explicit |

## Visual Evidence Anomaly Scan (if designs / screenshots provided)
| Anomaly ID | Screen / Artifact | Observed Anomaly / Inconsistency | Risk / Impact | Action / Open Question |
| :--- | :--- | :--- | :--- | :--- |
| ANOM-01 | ... | (broken asset, language mixing, sorting contradiction, missing limits) | High/Med/Low | ... |

## Known Constraints & Data Seeding Needs
- Limits (min/max lengths, counts, timeouts, rolling time windows):
- Supported languages / locale formats:
- Roles and permissions:
- Required Data Fixtures (empty state `DS-01`, threshold/multi-page `DS-02`, boundary timestamps `DS-03`):
- Dependencies on external APIs / 3rd parties:

## Out of Scope
- ...

## Open Questions
| # | Question | Blocking? | Owner | Options (* Recommended) |
| :-- | :-- | :-: | :-- | :-- |
| Q1 | ... | yes/no | product/dev | A) ... (Recommended), B) ... |

## Assumptions
| # | Assumption | Related AC | Basis / Evidence |
| :-- | :-- | :-- | :-- |
| A1 | ... | AC-0x | Observed from screenshot / RFC standard |
