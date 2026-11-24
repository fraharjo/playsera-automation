# Promotion Checklist (Draft to Regression Suite)

Generated test design artifacts live in `generated/<feature>/`. Once reviewed and approved by the QA engineer or team, follow these steps to promote them into the active test suite.

## The Skill Never Promotes Automatically
Promoting requires human intent to ensure test stability, code review alignment, and selector accuracy.

## Step-by-Step Promotion

1. **Verify Draft Quality**:
   ```bash
   npm run check:generated -- generated/<feature>
   ```
   Ensure 0 errors.

2. **Move Files**:
   - Move `<feature>.page.ts` to `tests/pages/<feature>.page.ts`.
   - Move `<feature>.spec.ts` to `tests/web/<feature>.spec.ts` (or `tests/api/<feature>.spec.ts` if API-first).
   - Move `<feature>.api.ts` (if generated) to `tests/helpers/<feature>.api.ts` or `shared/api/`.
   - Keep `test-matrix.md` in `docs/matrices/<feature>-matrix.md` or archive in Jira for auditability.

3. **Validate Code & Types**:
   ```bash
   npm run lint:tags
   npm run typecheck
   ```

4. **Reconcile Selectors**:
   If any locators used `this.contract(...)`, replace them with production selectors once UI implementation is available, or verify that developers implemented the specified `data-testid` attributes.

5. **Dry Run**:
   ```bash
   npx playwright test tests/web/<feature>.spec.ts --grep @smoke
   ```
