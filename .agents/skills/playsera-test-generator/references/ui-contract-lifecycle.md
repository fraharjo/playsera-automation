# UI Contract Lifecycle and Selector Rules (Playwright Edition)

## Contents
1. Selector rules
2. Initial run: the checklist
3. Subsequent run: new build reconciliation
4. Element diagnosis

## 1. Selector Rules
- **Existing Web Apps**: Never invent selectors. Use Playwright's role-based locators (`getByRole`, `getByLabel`, `getByText`) or verified DOM selectors.
- **Greenfield / Shift-Left Features**: Wrap unmapped locators with `this.contract('<feature>-<element>-<type>')`.
  - On Web, `contract('login-submit-btn')` automatically matches `[data-testid="login-submit-btn"]`, `[name="login-submit-btn"]`, and `#login-submit-btn`.
- Always declare assertion selectors: success screens, validation error messages, modal titles.
- Prefer `data-testid` over fragile XPath. If an element lacks a unique attribute, list it in the matrix as a developer request.

## 2. Initial Run: The Checklist
When any element uses `this.contract(...)`, output an **Actionable Missing Locator / UI Contract Checklist** table in chat and in `test-matrix.md`:

| Screen / Page | Element getter | Recommended contract ID | Recommended Attribute |
| :--- | :--- | :--- | :--- |
| LoginPage | btnSubmit | `login-submit-btn` | `data-testid="login-submit-btn"` |
| LoginPage | alertError | `login-error-alert` | `data-testid="login-error-alert"` |

## 3. Subsequent Run: New Build Reconciliation
When a new staging deployment or feature branch arrives:
- **[A] DOM inspection**: Inspect the live browser page with Playwright Codegen (`npx playwright codegen <url>`) or DevTools to verify element attributes.
- **[B] Interactive fill-in**: The QA engineer replaces `this.contract(...)` calls with actual locators.
- **[C] Contract verification**: Keep `data-testid` locators so developers maintain standard testability attributes across releases.

## 4. Element Diagnosis
Classify every missing or failing locator into:
- `TESTABILITY GAP`: Element is rendered visually but lacks stable attributes (`data-testid`, unique id, or accessible role/name). Action: Dev request.
- `POTENTIAL DEFECT`: Element is completely missing when the AC explicitly states it should appear. Action: QA bug report.
- `CONDITIONAL / STANDBY`: Dynamic element (error toast, modal dialog) that appears only after a specific action.
- `TIMING / SYNCHRONIZATION`: Element takes time to render due to network latency. Action: Use Playwright web-first assertions (`await expect(locator).toBeVisible()`).
