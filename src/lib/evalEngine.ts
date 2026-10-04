import { EvalCase, EvalRun, EvalResultCase, AgentOrderState } from '@/types';
import { MockPOSAdapter, TransformationConfig, DEFAULT_DEFECTIVE_CONFIG } from './posAdapter';
import { parseCustomerUtterance } from './utteranceParser';

export const SCENARIO_1_EVAL_CASES: EvalCase[] = [
  {
    id: 'eval_s1_01',
    scenarioId: 'scenario_1_lost_modifier',
    inputPrompt: 'Double cheeseburger, no onions, extra pickles.',
    expectedNormalizedState: {
      item: 'Double Cheeseburger',
      quantity: 1,
      addModifiers: ['Extra Pickles'],
      removeModifiers: ['Onions'],
    },
    expectedPosPayloadCheck: {
      hasAddModifiers: ['Extra Pickles'],
      hasRemoveModifiers: ['Onions'],
      expectedTotalItemsCount: 1,
    },
  },
  {
    id: 'eval_s1_02',
    scenarioId: 'scenario_1_lost_modifier',
    inputPrompt: 'Hold the onions on that cheeseburger.',
    expectedNormalizedState: {
      item: 'Double Cheeseburger',
      quantity: 1,
      addModifiers: [],
      removeModifiers: ['Onions'],
    },
    expectedPosPayloadCheck: {
      hasAddModifiers: [],
      hasRemoveModifiers: ['Onions'],
      expectedTotalItemsCount: 1,
    },
  },
  {
    id: 'eval_s1_03',
    scenarioId: 'scenario_1_lost_modifier',
    inputPrompt: 'Double cheeseburger without onion.',
    expectedNormalizedState: {
      item: 'Double Cheeseburger',
      quantity: 1,
      addModifiers: [],
      removeModifiers: ['Onions'],
    },
    expectedPosPayloadCheck: {
      hasAddModifiers: [],
      hasRemoveModifiers: ['Onions'],
      expectedTotalItemsCount: 1,
    },
  },
  {
    id: 'eval_s1_04',
    scenarioId: 'scenario_1_lost_modifier',
    inputPrompt: 'Double cheeseburger, everything except onions.',
    expectedNormalizedState: {
      item: 'Double Cheeseburger',
      quantity: 1,
      addModifiers: [],
      removeModifiers: ['Onions'],
    },
    expectedPosPayloadCheck: {
      hasAddModifiers: [],
      hasRemoveModifiers: ['Onions'],
      expectedTotalItemsCount: 1,
    },
  },
  {
    id: 'eval_s1_05',
    scenarioId: 'scenario_1_lost_modifier',
    inputPrompt: 'Take the onions off the double cheeseburger.',
    expectedNormalizedState: {
      item: 'Double Cheeseburger',
      quantity: 1,
      addModifiers: [],
      removeModifiers: ['Onions'],
    },
    expectedPosPayloadCheck: {
      hasAddModifiers: [],
      hasRemoveModifiers: ['Onions'],
      expectedTotalItemsCount: 1,
    },
  },
  {
    id: 'eval_s1_06',
    scenarioId: 'scenario_1_lost_modifier',
    inputPrompt: 'No onion please on the burger.',
    expectedNormalizedState: {
      item: 'Double Cheeseburger',
      quantity: 1,
      addModifiers: [],
      removeModifiers: ['Onions'],
    },
    expectedPosPayloadCheck: {
      hasAddModifiers: [],
      hasRemoveModifiers: ['Onions'],
      expectedTotalItemsCount: 1,
    },
  },
  {
    id: 'eval_s1_07',
    scenarioId: 'scenario_1_lost_modifier',
    inputPrompt: 'Extra pickle, no onion.',
    expectedNormalizedState: {
      item: 'Double Cheeseburger',
      quantity: 1,
      addModifiers: ['Extra Pickles'],
      removeModifiers: ['Onions'],
    },
    expectedPosPayloadCheck: {
      hasAddModifiers: ['Extra Pickles'],
      hasRemoveModifiers: ['Onions'],
      expectedTotalItemsCount: 1,
    },
  },
  {
    id: 'eval_s1_08',
    scenarioId: 'scenario_1_lost_modifier',
    inputPrompt: 'Burger plain, only meat and cheese.',
    expectedNormalizedState: {
      item: 'Double Cheeseburger',
      quantity: 1,
      addModifiers: [],
      removeModifiers: ['Onions', 'Pickles', 'Special Sauce'],
    },
    expectedPosPayloadCheck: {
      hasAddModifiers: [],
      hasRemoveModifiers: ['Onions'],
      expectedTotalItemsCount: 1,
    },
  },
  {
    id: 'eval_s1_09',
    scenarioId: 'scenario_1_lost_modifier',
    inputPrompt: 'Double cheeseburger with no onions or tomato.',
    expectedNormalizedState: {
      item: 'Double Cheeseburger',
      quantity: 1,
      addModifiers: [],
      removeModifiers: ['Onions', 'Tomato'],
    },
    expectedPosPayloadCheck: {
      hasAddModifiers: [],
      hasRemoveModifiers: ['Onions', 'Tomato'],
      expectedTotalItemsCount: 1,
    },
  },
  {
    id: 'eval_s1_10',
    scenarioId: 'scenario_1_lost_modifier',
    inputPrompt: 'Keep everything except the onion.',
    expectedNormalizedState: {
      item: 'Double Cheeseburger',
      quantity: 1,
      addModifiers: [],
      removeModifiers: ['Onions'],
    },
    expectedPosPayloadCheck: {
      hasAddModifiers: [],
      hasRemoveModifiers: ['Onions'],
      expectedTotalItemsCount: 1,
    },
  },
  // TRICKY REGRESSION DETECTION CASE:
  // "Wait, no, onions are fine. Extra pickles only." - Customer correcting themselves!
  // If an engineer writes a naive regex for "no ... onions", it drops onions.
  // Our utteranceParser actively interprets this affirmative phrasing and preserves onions.
  {
    id: 'eval_s1_11_regression_guard',
    scenarioId: 'scenario_1_lost_modifier',
    inputPrompt: 'Wait, no, onions are fine. Extra pickles only.',
    expectedNormalizedState: {
      item: 'Double Cheeseburger',
      quantity: 1,
      addModifiers: ['Extra Pickles'],
      removeModifiers: [], // Must NOT remove onions!
    },
    expectedPosPayloadCheck: {
      hasAddModifiers: ['Extra Pickles'],
      hasRemoveModifiers: [],
      expectedTotalItemsCount: 1,
    },
  },
];

/**
 * Deterministic Eval Suite Runner
 *
 * CRITICAL PIPELINE PROOF:
 * Takes the raw natural language `inputPrompt` string, executes `parseCustomerUtterance(c.inputPrompt)`,
 * constructs the live `AgentOrderState`, passes it to the `MockPOSAdapter`,
 * and validates both conversational interpretation and POS serialization!
 */
export function runRegressionSuite(
  cases: EvalCase[] = SCENARIO_1_EVAL_CASES,
  config: TransformationConfig = DEFAULT_DEFECTIVE_CONFIG,
  patchId?: string
): EvalRun {
  const adapter = new MockPOSAdapter(config);
  const results: EvalResultCase[] = [];

  for (const c of cases) {
    // 1. GENUINE EXECUTION: Parse raw customer phone utterance
    const parsed = parseCustomerUtterance(c.inputPrompt);

    // 2. Build live conversational agent order state from parsed utterance
    const agentState: AgentOrderState = {
      orderId: `eval_order_${c.id}`,
      customerIntent: 'PLACE_ORDER',
      orderType: 'PICKUP',
      customerPhone: '+15035550199',
      totalEstimatedPrice: 14.5,
      items: [
        {
          itemId: parsed.matchedItemId || 'item_cheeseburger_dbl',
          itemName: parsed.rawItemName,
          quantity: parsed.quantity,
          unitPrice: 14.5,
          modifiers: parsed.modifiers,
        },
      ],
    };

    // 3. Verify Conversational Layer Interpretation against expectation
    let convPassed = true;
    let convFailure = '';
    for (const expAdd of c.expectedNormalizedState.addModifiers) {
      if (!agentState.items[0].modifiers.add.includes(expAdd)) {
        convPassed = false;
        convFailure += `NLU failed to parse expected ADD "${expAdd}". `;
      }
    }
    for (const expRem of c.expectedNormalizedState.removeModifiers) {
      if (!agentState.items[0].modifiers.remove.includes(expRem)) {
        convPassed = false;
        convFailure += `NLU failed to parse expected REMOVE "${expRem}". `;
      }
    }
    // Regression guard check: verify no accidental removal
    if (c.expectedNormalizedState.removeModifiers.length === 0 && agentState.items[0].modifiers.remove.length > 0) {
      convPassed = false;
      convFailure += `NLU incorrectly triggered REMOVE on affirmative phrase. `;
    }

    // 4. Pass conversational state into MockPOSAdapter
    const transformResult = adapter.transformOrder(agentState);
    const payload = transformResult.payload;

    if (!payload || !convPassed) {
      results.push({
        caseId: c.id,
        inputPrompt: c.inputPrompt,
        passed: false,
        observedNormalizedState: {
          item: agentState.items[0].itemName,
          addModifiers: agentState.items[0].modifiers.add,
          removeModifiers: agentState.items[0].modifiers.remove,
        },
        observedPosPayload: payload ? { total: payload.totalAmount } : null,
        failureReason: convFailure || transformResult.errorReason || 'Transformation returned null payload',
      });
      continue;
    }

    const firstItem = payload.lineItems[0];
    const posAddMods = firstItem.modifiers
      .filter((m) => m.action === 'ADD')
      .map((m) => m.name.toLowerCase());
    const posRemMods = firstItem.modifiers
      .filter((m) => m.action === 'REMOVE')
      .map((m) => m.name.toLowerCase());

    // 5. Check POS serialization assertions
    let passed = true;
    let failureReason = '';

    for (const expAdd of c.expectedPosPayloadCheck.hasAddModifiers) {
      const found = posAddMods.some((m) => m.includes(expAdd.toLowerCase()));
      if (!found) {
        passed = false;
        failureReason += `Missing expected ADD modifier "${expAdd}" in POS payload. `;
      }
    }

    for (const expRem of c.expectedPosPayloadCheck.hasRemoveModifiers) {
      const found = posRemMods.some((m) => m.includes(expRem.toLowerCase()));
      if (!found) {
        passed = false;
        failureReason += `Missing expected REMOVE modifier "${expRem}" in POS payload. `;
      }
    }

    if (c.expectedPosPayloadCheck.hasRemoveModifiers.length === 0 && posRemMods.length > 0) {
      passed = false;
      failureReason += `Spurious REMOVE modifier "${posRemMods.join(', ')}" found when none expected. `;
    }

    results.push({
      caseId: c.id,
      inputPrompt: c.inputPrompt,
      passed,
      observedNormalizedState: {
        item: firstItem.name,
        addModifiers: agentState.items[0].modifiers.add,
        removeModifiers: agentState.items[0].modifiers.remove,
      },
      observedPosPayload: {
        posModifiers: firstItem.modifiers.map((m) => `${m.action}: ${m.name}`),
        total: payload.totalAmount,
      },
      failureReason: passed ? undefined : failureReason.trim(),
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const passRate = Number(((passedCount / results.length) * 100).toFixed(1));

  return {
    scenarioId: cases[0]?.scenarioId || 'unknown',
    patchApplied: config.preserveNegativeModifiers,
    patchId,
    totalCases: results.length,
    passedCases: passedCount,
    passRatePercent: passRate,
    results,
    executedAt: new Date().toISOString(),
  };
}
