# EXPO: Restaurant Agent Reliability Lab

> A simulated production engineering workbench for diagnosing, fixing, and regression-testing failures in deployed restaurant Voice AI agents.

---

## ⚠️ Synthetic Data & Platform Disclaimer
**All restaurant names, customer information, calls, audio transcripts, traces, incidents, financial metrics, and POS payloads in this repository are entirely synthetic.**

No affiliation with or integration into Toast, Retell, Langfuse, Loman AI, or other third-party platforms is implied. Modeled financial figures reflect synthetic unit-economics formulas designed to illustrate Forward Deployed Engineering reasoning.

---

## ⏱️ 60-Second Demo Path (Quick Tour)
1. **Open the Workbench** (`http://localhost:3000`):
   - You land directly on **Incident INC-8492: The Lost Modifier**.
2. **Inspect the Boundary Failure (Steps 1 & 2)**:
   - Expand `POS_MODIFIER_MAPPED` in the **Trace Viewer** to see conversational state (`remove: ["onions"]`) vs kitchen serialization (0 exclusions).
   - In the **Order State Inspector**, observe the side-by-side mismatch where onions were omitted.
3. **Activate the Patched Runtime (Step 3)**:
   - Click **Activate Patched Runtime** in the Fix Workspace. Notice the unified diff showing negative modifier iteration.
4. **Replay & Verify (Step 4)**:
   - Click **Run Replay** to watch the kitchen ticket transition from `FAIL` (burger cooked with onions) to `PASS` (`- Onions, + Extra Pickles`).
5. **Run the Regression Suite (Step 5)**:
   - Click **RUN REGRESSION**. Watch the deterministic eval suite test 11 natural language utterances (including *"Hold the onions"*, *"Burger plain"*, and the regression guard *"Wait, no, onions are fine"*), taking pass rates to 100%.
6. **Switch Scenarios via Incident Queue**:
   - Click **Incidents Queue** in the navigation header, select **INC-8495: Half-and-Half Pizza Split**, and watch the entire workbench dynamically adapt to fractional topping boundary repairs.

---

## 🎯 Architecture & Executable Scope

```
+-----------------------------------------------------------------------------------------+
|                                    INBOUND TELEPHONY                                    |
| Caller Utterance: "Double cheeseburger, no onions, extra pickles."                      |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                    NATURAL LANGUAGE PARSER & STATE REDUCER                              |
| `src/lib/utteranceParser.ts` & `src/lib/stateReducer.ts`                                |
| Real semantic parsing: captures exclusions, idioms, and multi-turn quantity revisions   |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                               CONVERSATIONAL STATE MANAGER                              |
| AgentOrderState:                                                                        |
| { item: "Double Cheeseburger", modifiers: { add: ["Extra Pickles"], remove: ["Onions"]} |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                 MOCK POS ADAPTER V2.1                                   |
| `src/lib/posAdapter.ts`                                                                 |
| Real TypeScript transformation engine: converts state into POS JSON payloads            |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                              RESTAURANT KITCHEN DISPATCH (KDS)                          |
| Kitchen ticket printed / Make-line display rendered                                     |
+-----------------------------------------------------------------------------------------+
```

### Truthful Implementation Status:
- **7 production incident scenarios modeled** in telemetry, traces, and financial exposure.
- **4 core scenarios backed by live executable defect and patch logic**:
  1. **Scenario 1 (Lost Modifier)**: Full pipeline from raw utterance parsing → conversational state → defective/patched POS serialization → regression suite.
  2. **Scenario 2 (Half-and-Half Split)**: Nested split toppings flattened into whole pie vs preserved as `FIRST_HALF` / `SECOND_HALF`.
  3. **Scenario 3 (Temporal Menu Hours)**: Operating cutoff enforcement (11 AM - 3 PM Lunch Special) with UTC hour checks.
  4. **Scenario 4 (Multi-Turn Quantity)**: Executable dialog state reducer (`applyTurn()`) handling verbal revisions like *"Actually make that three"*.
  5. **Scenario 7 (Webhook Idempotency)**: Duplicate order prevention via idempotency cache keys.
- **Scenarios 5 & 6**: Modeled as production incident traces and policy guardrail violations.

---

## 🔬 Conversational Eval Engine
Unlike static mock dashboards, EXPO's regression eval suite (`src/lib/evalEngine.ts`) takes raw natural language strings, runs them through `parseCustomerUtterance()`, feeds structured state into `MockPOSAdapter()`, and evaluates structured assertions:
- **Negation idioms tested**: *"No onions"*, *"Hold the onions"*, *"Double cheeseburger without onion"*, *"Everything except onions"*, *"Take the onions off"*, *"Burger plain"*, *"No onions or tomato"*.
- **The Critical Regression Guard**: Tests *"Wait, no, onions are fine. Extra pickles only."* to verify that regex/pattern fixes do not falsely strip requested ingredients when callers self-correct.

---

## 🛠️ Tech Stack & CI
- **Framework**: Next.js 14 (App Router), React, TypeScript
- **Testing**: Vitest (`vite.config.ts` configured for fast ESM test execution)
- **CI**: Automated GitHub Actions workflow (`.github/workflows/ci.yml`) running `npm ci`, `npm run lint`, `npm test`, and `npm run build` on every push and PR.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run unit & regression tests
npm run test

# 3. Build production bundle & verify typecheck
npm run build

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to inspect the workbench.
