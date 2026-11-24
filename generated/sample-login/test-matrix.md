# Test Matrix: User Login

## 1. Summary
- Source: Jira `@JIRA-AUTH-101`, Requirement `@REQ-AUTH-01`
- Feature: Login Module (`@feature-login`)
- Platform: `@web`
- Mode: full
- Counts: Total 3 (Automated: 3, Manual: 0, Blocked: 1)

## 2. Assumptions & Open Questions
| ID | Type | Description | Related AC | Status |
| :--- | :--- | :--- | :--- | :--- |
| Q1 | Open question | Should account lock after 5 attempts? | AC-03 | Blocked (E01) |

## 3. AC Traceability
| AC ID | Description | Scenario IDs | Verdict |
| :--- | :--- | :--- | :--- |
| AC-01 | User can log in with valid credentials | P01 | Full |
| AC-02 | Error shown on invalid credentials | N01 | Full |
| AC-03 | Lockout policy after failed attempts | E01 | Blocked |

## 4. Scenario Pool
| ID | AC | Bucket | Technique | Channel | Description | Risk | Disposition | Tags |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| P01 | AC-01 | Positive | Equivalence Partitioning | UI | P01: User logs in successfully with valid credentials | H | Automate | `@smoke @p0 @automated @web @positive @AC-01 @feature-login @REQ-AUTH-01` |
| N01 | AC-02 | Negative | Error Guessing | UI | N01: Show error alert when password is incorrect | M | Automate | `@regression @p1 @automated @web @negative @AC-02 @feature-login @REQ-AUTH-01` |
| E01 | AC-03 | Edge | State Transition | UI | E01: Account lockout after consecutive failed attempts | M | Blocked | `@regression @p2 @automated @web @negative @AC-03 @feature-login @REQ-AUTH-01 @blocked` |

## 5. Derived Scenarios
- None (0 of 5 cap).

## 6. Testability Requests / UI Contract Checklist
| Screen | Element getter | Recommended Contract ID | Dev Format |
| :--- | :--- | :--- | :--- |
| LoginPage | alertError | `login-error-alert` | `data-testid="login-error-alert"` |
| LoginPage | dashboardHeader | `dashboard-welcome-header` | `data-testid="dashboard-welcome-header"` |
