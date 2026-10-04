# System Architecture: EXPO Restaurant Agent Reliability Lab

## 1. Overview
EXPO is an internal engineering diagnostic workbench modeled after high-stakes Forward Deployed Engineering (FDE) operations in production restaurant Voice AI systems.

The core design principle is **architectural boundary isolation**:
When an end-user customer places an order over the phone and the food arrives wrong at the restaurant, traditional operators attribute it to "the AI hallucinating." EXPO systematically proves that conversational NLU, conversational state management, and downstream POS payload transformations are distinct failure boundaries.

```
+-----------------------------------------------------------------------------------------+
|                                    INBOUND TELEPHONY                                    |
| Caller Utterance: "Double cheeseburger, no onions, extra pickles."                      |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                     ASR & NLU LAYER                                     |
| Intent: PLACE_ORDER | Item: "Double Cheeseburger"                                       |
| Parsed Modifiers: add=["Extra Pickles"], remove=["Onions"]                              |
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
| (Defect Location: Serialization Boundary)                                               |
| Unpatched: Drops `remove` list -> POS payload contains burger + pickles only            |
| Patched: Iterates `remove` list -> POS payload contains {action: "REMOVE", name: "Onion"|
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                              RESTAURANT KITCHEN DISPATCH (KDS)                          |
| Kitchen ticket printed / Make-line display rendered                                     |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Component Separation

1. **`src/types/index.ts`**:
   Comprehensive TypeScript models representing restaurant metadata, menus, modifier groups, agent conversational state, POS order payloads, execution traces, incidents, evals, and financial models.

2. **`src/lib/posAdapter.ts`**:
   The deterministic POS integration adapter. Implements exact transformations between `AgentOrderState` and `POSOrderPayload`. Contains runtime configuration flags to toggle between the unpatched (defective) and patched behavior.

3. **`src/lib/evalEngine.ts`**:
   Deterministic evaluation runner that tests conversational assertions and POS payload assertions against edge cases (hold onions, without onion, plain, everything except onions) and regression guards ("No, onions are fine").

4. **`src/data/menu.ts`**:
   Full Sidecar Pizza Co. menu fixture containing modifier groups, pizza sizes, crusts, availability windows (11am-3pm lunch special), and allergen data.

5. **`src/data/scenario1Fixtures.ts` & `src/data/additionalScenarios.ts`**:
   Synthetic production fixtures reproducing 7 distinct failure scenarios with granular timestamps, component metadata, and linked trace IDs.

6. **UI Components (`src/components/`)**:
   - `HeaderNav.tsx`: Cluster status and scenario switcher
   - `TraceViewer.tsx`: Execution trace explorer with timeline duration and boundary defect alerts
   - `OrderStateInspector.tsx`: Side-by-side comparison between conversational layer and POS ticket
   - `FixWorkspace.tsx`: Unified diff viewer and live patch applier
   - `ReplayComparison.tsx`: Production before-and-after ticket comparison
   - `RegressionEvalSuite.tsx`: Live regression suite runner with 11 test cases and assertion reporting
   - `EngineeringHandoff.tsx`: Jira/Linear ticket generator and GM customer communication translator
   - `IncidentQueue.tsx`: Categorized failure backlog
   - `AccountHealth.tsx`: Account-level metrics with Signal-style modeled financial impact
