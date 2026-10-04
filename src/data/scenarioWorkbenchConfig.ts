import { Patch, EvalCase } from '@/types';

export interface ScenarioWorkbenchMeta {
  scenarioId: string;
  scenarioTitle: string;
  inspectorSubtitle: string;
  diffComponent: string;
  diffHunk: string;
  patch: Patch;
  evalCases: EvalCase[];
}

export const WORKBENCH_SCENARIO_CONFIGS: Record<string, ScenarioWorkbenchMeta> = {
  scenario_1_lost_modifier: {
    scenarioId: 'scenario_1_lost_modifier',
    scenarioTitle: 'Scenario 1: The Lost Modifier (Negative Modifiers Dropped)',
    inspectorSubtitle: 'Observe where negative exclusions (e.g. "no onions") are dropped at the POS boundary',
    diffComponent: 'src/lib/posAdapter.ts · transformOrder()',
    diffHunk: `--- a/src/lib/posAdapter.ts
+++ b/src/lib/posAdapter.ts
@@ -82,6 +82,16 @@ export class MockPOSAdapter {
       itemModifierCost += modMeta.priceDelta;
     }

+    // 2. Process REMOVE modifiers (Patch for INC-8492)
+    for (const remMod of item.modifiers.remove || []) {
+      const modMeta = this.resolveModifierMeta(remMod);
+      posModifiers.push({
+        modifierId: modMeta.id,
+        name: modMeta.name,
+        action: 'REMOVE',
+        priceDelta: 0.0,
+        targetFraction: 'WHOLE',
+      });
+    }`,
    patch: {
      id: 'patch_pos_mod_01',
      incidentId: 'INC-8492',
      title: 'POSAdapter: iterate negative modifier state and emit REMOVE action',
      reasonForChange:
        'Conversational state captures negative exclusions in `item.modifiers.remove`, but MockPOSAdapter legacy loop only transformed additions.',
      affectedComponent: 'src/lib/posAdapter.ts',
      riskLevel: 'LOW',
      expectedBehavior:
        'All elements in `modifiers.remove` serialize as `{ action: "REMOVE", name: mod.name }`.',
      author: 'fde-oncall@sidecar-pizza.internal',
      timestamp: '2026-10-04T07:20:00Z',
      version: '2.1.0-patch1',
      codeDiff: '',
    },
    evalCases: [], // Filled dynamically from SCENARIO_1_EVAL_CASES
  },

  scenario_2_half_and_half: {
    scenarioId: 'scenario_2_half_and_half',
    scenarioTitle: 'Scenario 2: Half-and-Half Pizza Split Mappings',
    inspectorSubtitle: 'Observe where 1st Half / 2nd Half split toppings are flattened into whole-pizza coverage',
    diffComponent: 'src/lib/posAdapter.ts · transformOrder()',
    diffHunk: `--- a/src/lib/posAdapter.ts
+++ b/src/lib/posAdapter.ts
@@ -105,7 +105,17 @@ export class MockPOSAdapter {
-    for (const h of [...item.modifiers.halfOneAdd, ...item.modifiers.halfTwoAdd]) {
-      posModifiers.push({ targetFraction: 'WHOLE' }); // BUG: Flattened!
+    for (const h1 of item.modifiers.halfOneAdd || []) {
+      posModifiers.push({ name: \`\${h1} (1st Half)\`, targetFraction: 'FIRST_HALF', priceDelta: meta.priceDelta * 0.5 });
+    }
+    for (const h2 of item.modifiers.halfTwoAdd || []) {
+      posModifiers.push({ name: \`\${h2} (2nd Half)\`, targetFraction: 'SECOND_HALF', priceDelta: meta.priceDelta * 0.5 });
+    }`,
    patch: {
      id: 'patch_pos_half_02',
      incidentId: 'INC-8495',
      title: 'POSAdapter: support fractional split modifiers (FIRST_HALF / SECOND_HALF)',
      reasonForChange:
        'Unpatched adapter flattened all half-and-half toppings into whole-pie additions, resulting in kitchen cross-contamination.',
      affectedComponent: 'src/lib/posAdapter.ts',
      riskLevel: 'LOW',
      expectedBehavior:
        'Separate halfOneAdd and halfTwoAdd into targetFraction="FIRST_HALF" and "SECOND_HALF" with 50% modifier pricing.',
      author: 'fde-oncall@sidecar-pizza.internal',
      timestamp: '2026-10-04T07:45:00Z',
      version: '2.1.0-patch2',
      codeDiff: '',
    },
    evalCases: [
      {
        id: 'eval_s2_01',
        scenarioId: 'scenario_2_half_and_half',
        inputPrompt: 'Large pizza, half pepperoni and half mushroom.',
        expectedNormalizedState: {
          item: 'Large 16" Custom Pizza',
          quantity: 1,
          addModifiers: [],
          removeModifiers: [],
          halfOneAdd: ['Pepperoni'],
          halfTwoAdd: ['Cremini Mushrooms'],
        },
        expectedPosPayloadCheck: {
          hasAddModifiers: ['Pepperoni (1st Half)', 'Cremini Mushrooms (2nd Half)'],
          hasRemoveModifiers: [],
          expectedTotalItemsCount: 1,
          halfAndHalfPreserved: true,
        },
      },
      {
        id: 'eval_s2_02',
        scenarioId: 'scenario_2_half_and_half',
        inputPrompt: 'Large pie, left side sausage, right side black olives.',
        expectedNormalizedState: {
          item: 'Large 16" Custom Pizza',
          quantity: 1,
          addModifiers: [],
          removeModifiers: [],
          halfOneAdd: ['Fennel Sausage'],
          halfTwoAdd: ['Black Olives'],
        },
        expectedPosPayloadCheck: {
          hasAddModifiers: ['Fennel Sausage (1st Half)', 'Black Olives (2nd Half)'],
          hasRemoveModifiers: [],
          expectedTotalItemsCount: 1,
          halfAndHalfPreserved: true,
        },
      },
    ],
  },

  scenario_3_temporal_menu: {
    scenarioId: 'scenario_3_temporal_menu',
    scenarioTitle: 'Scenario 3: Temporal Menu Availability Boundary',
    inspectorSubtitle: 'Observe where lunch combo specials are offered past their 3:00 PM operating cutoff',
    diffComponent: 'src/lib/posAdapter.ts · transformOrder()',
    diffHunk: `--- a/src/lib/posAdapter.ts
+++ b/src/lib/posAdapter.ts
@@ -45,6 +45,14 @@ export class MockPOSAdapter {
+    // Enforce availability hours (Patch for INC-8501)
+    const orderHour = new Date(callTimestampIso).getUTCHours();
+    if (menuItem?.availabilityWindow) {
+      const { startHour, endHour } = menuItem.availabilityWindow;
+      if (orderHour < startHour || orderHour >= endHour) {
+        return { success: false, errorReason: 'ITEM_UNAVAILABLE_AT_HOURS' };
+      }
+    }`,
    patch: {
      id: 'patch_menu_temp_03',
      incidentId: 'INC-8501',
      title: 'POSAdapter: enforce MenuItem.availabilityWindow validation against call timestamp',
      reasonForChange:
        'Menu queries returned active lunch items at 8:15 PM because operating hour bounds were ignored.',
      affectedComponent: 'src/lib/posAdapter.ts',
      riskLevel: 'LOW',
      expectedBehavior:
        'Reject submission with ITEM_UNAVAILABLE_AT_HOURS when ordered outside configured startHour/endHour.',
      author: 'fde-oncall@sidecar-pizza.internal',
      timestamp: '2026-10-04T07:50:00Z',
      version: '2.1.0-patch3',
      codeDiff: '',
    },
    evalCases: [
      {
        id: 'eval_s3_01',
        scenarioId: 'scenario_3_temporal_menu',
        inputPrompt: 'Lunch special slices ordered at 8:15 PM.',
        expectedNormalizedState: {
          item: 'Lunch Special: 2 Slices & Soda',
          quantity: 1,
          addModifiers: [],
          removeModifiers: [],
        },
        expectedPosPayloadCheck: {
          hasAddModifiers: [],
          hasRemoveModifiers: [],
          expectedTotalItemsCount: 1,
          rejectedOutOfHours: true,
        },
      },
    ],
  },

  scenario_4_quantity_state: {
    scenarioId: 'scenario_4_quantity_state',
    scenarioTitle: 'Scenario 4: Multi-Turn Quantity State Reducer',
    inspectorSubtitle: 'Observe where verbal corrections ("Actually make that three") fail to mutate order quantity',
    diffComponent: 'src/lib/stateReducer.ts · applyTurn()',
    diffHunk: `--- a/src/lib/stateReducer.ts
+++ b/src/lib/stateReducer.ts
@@ -35,6 +35,12 @@ export function applyTurn(currentState, utterance) {
+    // Match conversational quantity replacement idiom (Patch for INC-8508)
+    const match = /(?:make (?:that|it)|actually|change to) (\\d+|two|three|four)/i.exec(text);
+    if (match) {
+      primaryItem.quantity = parseNumber(match[1]);
+      verbalConfirmation = \`Got it, updated to \${primaryItem.quantity} \${primaryItem.itemName}.\`;
+    }`,
    patch: {
      id: 'patch_state_qty_04',
      incidentId: 'INC-8508',
      title: 'StateReducer: mutate primaryItem.quantity upon conversational revision utterance',
      reasonForChange:
        'Voice agent verbally confirmed 3 pizzas, but dialog state machine dropped the quantity mutation slot.',
      affectedComponent: 'src/lib/stateReducer.ts',
      riskLevel: 'MEDIUM',
      expectedBehavior:
        'Conversational state transitions from quantity 2 to 3 upon caller revision.',
      author: 'fde-oncall@sidecar-pizza.internal',
      timestamp: '2026-10-04T08:10:00Z',
      version: '2.1.0-patch4',
      codeDiff: '',
    },
    evalCases: [
      {
        id: 'eval_s4_01',
        scenarioId: 'scenario_4_quantity_state',
        inputPrompt: 'Two pepperoni pizzas -> Actually make that three.',
        expectedNormalizedState: {
          item: 'Large Pepperoni Pizza',
          quantity: 3,
          addModifiers: ['Pepperoni'],
          removeModifiers: [],
        },
        expectedPosPayloadCheck: {
          hasAddModifiers: ['Pepperoni'],
          hasRemoveModifiers: [],
          expectedTotalItemsCount: 1,
        },
      },
    ],
  },

  scenario_7_webhook_retry: {
    scenarioId: 'scenario_7_webhook_retry',
    scenarioTitle: 'Scenario 7: Webhook Retry Idempotency Lock',
    inspectorSubtitle: 'Observe where network ACK timeout retries generate duplicate kitchen tickets',
    diffComponent: 'src/lib/posAdapter.ts · transformOrder()',
    diffHunk: `--- a/src/lib/posAdapter.ts
+++ b/src/lib/posAdapter.ts
@@ -32,6 +32,10 @@ export class MockPOSAdapter {
+    // Enforce idempotency key deduplication (Patch for INC-8528)
+    if (this.processedIdempotencyKeys.has(agentState.orderId)) {
+      return { success: false, isDuplicateRejected: true, errorReason: 'Idempotency violation' };
+    }
+    this.processedIdempotencyKeys.add(agentState.orderId);`,
    patch: {
      id: 'patch_webhook_idemp_07',
      incidentId: 'INC-8528',
      title: 'MockPOSAdapter: reject duplicate orderId submissions via idempotency cache',
      reasonForChange:
        'Network ACK timeout triggered webhook retry with missing Idempotency-Key, printing duplicate kitchen orders.',
      affectedComponent: 'src/lib/posAdapter.ts',
      riskLevel: 'LOW',
      expectedBehavior:
        'Secondary submission with identical orderId returns isDuplicateRejected: true without creating ticket.',
      author: 'fde-oncall@sidecar-pizza.internal',
      timestamp: '2026-10-04T08:25:00Z',
      version: '2.1.0-patch7',
      codeDiff: '',
    },
    evalCases: [
      {
        id: 'eval_s7_01',
        scenarioId: 'scenario_7_webhook_retry',
        inputPrompt: 'Webhook retry with existing orderId pos_tx_ord_sc7_001.',
        expectedNormalizedState: {
          item: 'Large Pepperoni & Bacon Pizza',
          quantity: 1,
          addModifiers: ['Pepperoni', 'Bacon'],
          removeModifiers: [],
        },
        expectedPosPayloadCheck: {
          hasAddModifiers: ['Pepperoni', 'Bacon'],
          hasRemoveModifiers: [],
          expectedTotalItemsCount: 1,
          duplicatePrevented: true,
        },
      },
    ],
  },
};
