# EXPO: Restaurant Agent Reliability Lab

> A simulated production engineering workbench for diagnosing, fixing, and regression-testing failures in deployed restaurant Voice AI agents.

---

## 🎯 Project Overview
EXPO demonstrates the systems engineering and operational discipline required by a **Forward Deployed Engineer (FDE)** operating restaurant phone AI agents in high-volume production.

Unlike generic dashboards or chatbot wrappers, EXPO provides:
- **Executable TypeScript POS Adapters**: Real deterministic transformations between conversational agent state and POS payloads.
- **Granular Root Cause Boundary Localization**: Visually and structurally proves the exact point where negative modifiers, split pizzas, or timestamps fail.
- **Deterministic Regression Eval Suite**: 11 linguistically distinct test cases evaluating compound exclusions, restaurant idioms ("hold the onions", "burger plain"), and self-correction regression guards ("Wait, no, onions are fine").
- **Signal-Style Operational ROI Modeling**: Translates technical traces into kitchen remakes, food waste, labor cost, and exposed guest lifetime value.
- **Bidirectional Handoff**: Produces Jira/Linear engineering tickets and plain-language operator summaries for store general managers.

---

## 🍕 Fictional Customer: Sidecar Pizza Co.
- **Concept**: High-volume artisan pizzeria & tavern
- **Menu Features**: Smash burgers, custom split pizzas, crust types, modifier exclusions, lunch specials with time windows, and house pesto.
- **Telephony Cluster**: Automated inbound phone agent handling orders, store hours, and staff escalation.

---

## 🔬 Complete Functional Vertical Slice: Scenario 1 (The Lost Modifier)
1. **The Inbound Call**: Customer orders a `"Double cheeseburger, no onions, extra pickles"`.
2. **The Conversational Layer**: Correctly records `add: ["extra pickles"]` and `remove: ["onions"]`.
3. **The Production Defect**: The POS adapter drops the negative modifier during serialization. The kitchen cooks the burger with onions.
4. **The Trace & State Inspector**: Traces the event down to `POS_MODIFIER_MAPPED` and proves `remove: ["onions"]` was omitted.
5. **The Fix Workspace**: Presents a unified code diff patching `MockPOSAdapter.ts`.
6. **Live Replay**: Re-executes the synthetic call stream through the patched adapter, generating the corrected kitchen ticket.
7. **Regression Suite**: Executes 11 test cases proving that pass rates rise from defective to 100% without breaking self-correction prompts.
8. **Engineering Handoff**: Auto-populates Jira tickets and operator communications.

---

## 📑 Failure Taxonomy & 7 Functional Scenarios
EXPO covers 7 distinct production failure layers:
1. **POS Mapping**: The Lost Modifier (Negative exclusions dropped)
2. **POS Mapping**: Half-and-Half Pizza Split (Split toppings flattened to whole pie)
3. **Menu Knowledge**: Temporal Availability (Offering 11am-3pm lunch special at 8:15 PM)
4. **Conversation State**: Multi-Turn Quantity ("Actually make that three")
5. **Safety**: Allergy Policy Violation (Unverified nut safety instead of warm staff transfer)
6. **Configuration**: Delivery Zone Geofence (Accepting delivery 11 miles away)
7. **Webhook**: Duplicate Order Retry (Missing idempotency keys on network timeout)

See [Failure Taxonomy](docs/failure-taxonomy.md) and [Scenarios](docs/scenarios.md) for full technical breakdowns.

---

## 🛠️ Tech Stack & Architecture
- **Framework**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Testing**: Vitest (Unit & Regression Tests)
- **Architecture**: Separated domain models (`src/types/`), executable adapters (`src/lib/`), regression eval engine (`src/lib/evalEngine.ts`), and synthetic fixtures (`src/data/`).

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run deterministic unit & regression tests
npm run test

# 3. Build production bundle & verify typecheck
npm run build

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to inspect the workbench.
