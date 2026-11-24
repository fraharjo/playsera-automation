# Automation Feasibility Reference (Playwright Edition)

Apply in Phase 4 (triage), never earlier.

## Playwright Native Capabilities

- **Network Interception & Mocking**: `page.route('**/api/v1/payment', route => ...)` enables simulating 4xx/5xx network errors, slow network conditions, and edge payloads without altering backend data.
- **File Upload & Download Verification**:
  - Download: `const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export CSV' }).click()]);`
  - Upload: `await page.locator('input[type="file"]').setInputFiles('/path/to/file');`
- **Multi-Tab & Popup Handling**: `const [newPage] = await Promise.all([context.waitForEvent('page'), page.getByText('Open Link').click()]);`
- **Geolocation & Permissions**: Easily emulate permissions (`['geolocation', 'notifications']`) and viewport/timezone via `browser.newContext({ permissions: ['geolocation'], geolocation: { latitude, longitude } })`.
- **Clock & Time Manipulation**: Use `page.clock.setFixedTime(...)` or `page.clock.fastForward(...)` to test time-based expiry and session timeouts without real-time delays.

## Environmental and Platform Dependency Tagging

Explicitly tag environmental dependencies:
- Platform / Engine: `@web`, `@api`, `@mobile-web`, `@chromium-only`.
- Role / Permission: `@auth-required`, `@admin-only`.

## Concrete Data Seeding Fixtures

Every test suite requiring non-trivial data must specify exact data fixture profiles in Testability Requests:
1. **Empty State Fixture (`DS-01`)**: User profile with zero activity records (verifies clean empty states and hidden action buttons).
2. **Gap / Sparse Fixture (`DS-02`)**: Records with intentional chronological gaps (e.g. transacted in month M and M+2, but M+1 empty) to verify omission of empty periods.
3. **Threshold & Pagination Fixture (`DS-03`)**: Heavy dataset exceeding single-page / viewport thresholds (e.g. $\ge 35$ items) to verify pagination and document layout boundaries.
4. **Time Boundary & Clock Fixture (`DS-04`)**: User records at the boundary of rolling time windows (e.g. month 24 vs month 25), requiring clock manipulation.
5. **Diverse Status Fixture (`DS-05`)**: Datasets containing non-standard transaction/entity statuses (e.g. Pending, Failed, Cancelled, Refunded) to verify filtering and document completeness.

## Idempotency and Concurrency

Drive rapid double-submit testing through parallel requests via `request.post(...)` or APIRequestContext rather than fragile UI double-clicks. If no test API exists, mark `@blocked` and list the API in the testability requests.

## API-Level Assertions

Status codes (401/403/404/422), payload shapes, and persisted state are asserted at the API channel (`@api`), using `BaseApiClient` or Playwright's `request` fixture, not through UI text.
