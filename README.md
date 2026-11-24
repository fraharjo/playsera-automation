# Playsera Automation 🎭

> **Agentic Playwright Test Automation Framework**: Native Playwright Test (`@playwright/test`), TypeScript, Page Object Model (POM), Smart Contracts, and ISTQB-traceable Test Design Generator.

---

## 🚀 Quick Start

### 1. Installation & Environment Setup
```bash
# Clone or navigate into repository
cd ~/Documents/playsera-automation

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 2. Run Automation Tests
```bash
# Run all tests in headless mode
npm run test

# Run tests with visible browser (headed)
npm run test:headed

# Open interactive Playwright UI mode
npm run test:ui

# Filter by tags
npm run test:smoke
npm run test:regression
npm run test:e2e

# Run specific project
npm run test:web
npm run test:api

# View HTML Test Report
npm run test:report
```

---

## 🧠 Playsera Test Generator Skill

This repository comes equipped with `.agents/skills/playsera-test-generator`, an agentic skill that turns business requirements (PRDs, Jira tickets, Figma mockups, User Stories) into high-rigor, traceable Playwright test suites.

### How to Trigger in Chat
Simply mention:
- *"Bantu generate test case Playwright untuk requirement login ini..."*
- *"Buat test design dan spec untuk fitur checkout berikut..."*
- *"Analisis PRD di requirements/inputs/onboarding/PRD.pdf lalu generate test suites-nya..."*

### Artifacts Produced
Artifacts are generated in `generated/<feature>/`:
1. `test-matrix.md` - Complete ISTQB test matrix with AC traceability, positive/negative/edge scenarios, datasets, and open questions.
2. `<feature>.page.ts` - TypeScript Page Object extending `BasePage` with Playwright locators and Smart Contracts (`this.contract(...)`).
3. `<feature>.spec.ts` - Native Playwright spec with complete tag metadata (`@smoke`, `@regression`, `@AC-xx`, etc.).
4. `<feature>.api.ts` - (Optional) API client helper extending `BaseApiClient` for API contract assertions or data seeding.

---

## 🏷️ Mandatory Tag Taxonomy

Every Playwright test case requires tags for CI/CD filtering and traceability:

| Category | Allowed Tags | Example |
| :--- | :--- | :--- |
| **Traceability** | `@REQ-<KEY>`, `@AC-<nn>`, `@JIRA-<KEY>` | `@AC-01`, `@REQ-AUTH-01` |
| **Module** | `@feature-<name>` | `@feature-checkout`, `@feature-login` |
| **Priority** | `@p0`, `@p1`, `@p2` | `@p0` (Smoke/Critical), `@p1` (Regression) |
| **Runner Filter** | `@smoke`, `@regression`, `@e2e` | Filtered via `npx playwright test --grep @smoke` |
| **Execution** | `@automated`, `@manual` | Prevents executing manual tests on CI |
| **Platform** | `@web`, `@api`, `@mobile-web` | Target platform / channel |
| **Type** | `@positive`, `@negative`, `@bva`, `@functional`, `@security`, `@permission`, `@concurrency`, `@localization`, `@accessibility` | Test technique classification |
| **Status (Optional)** | `@assumption`, `@blocked`, `@derived` | Flags open questions / unconfirmed behavior |

---

## 🛡️ Validation & Linting Commands

```bash
# Extract raw requirement text from .pdf, .docx, .html, .csv
npm run req:extract requirements/inputs/<feature>/PRD.pdf -- --save

# Mechanically verify a generated test draft (taxonomy, derived limits, matrix sync)
npm run check:generated -- generated/<feature>

# Lint test tags across the repository
npm run lint:tags

# Typecheck TypeScript definitions
npm run typecheck
```

---

## 📂 Project Structure

```text
playsera-automation/
├── .agents/
│   └── skills/
│       └── playsera-test-generator/     # Agentic Test Design Skill & References
├── requirements/
│   ├── _template.md                    # Standard requirement template
│   └── inputs/                         # Drop PRDs, PDFs, Jira exports, Figma mockups here
├── generated/                          # Staging ground for AI-generated drafts
│   └── <feature>/
│       ├── test-matrix.md
│       ├── <feature>.page.ts
│       └── <feature>.spec.ts
├── shared/
│   ├── api/base-api.client.ts          # Playwright APIRequestContext wrapper
│   ├── config/env.config.ts            # Environment variables & URLs
│   ├── data/data-factory.ts            # Dynamic test data generator
│   └── pages/base.page.ts              # Base Page Object with Smart Contracts
├── tests/                              # Promoted active test suite
│   ├── api/                            # API specs (*.spec.ts)
│   ├── pages/                          # Promoted Page Object Models
│   └── web/                            # Web specs (*.spec.ts)
├── scripts/
│   ├── check-generated.ts              # Draft verification gate
│   ├── extract-requirement.ts          # Document text extractor (.pdf, .docx, .html)
│   └── lint-tags.ts                    # Test tag taxonomy linter
├── playwright.config.ts                # Playwright Test configuration
├── tsconfig.json                       # TypeScript compiler options
└── package.json
```
