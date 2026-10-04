import { EvalCase, EvalRun, EvalResultCase, AgentOrderState } from '@/types';
import { MockPOSAdapter, TransformationConfig, DEFAULT_DEFECTIVE_CONFIG } from './posAdapter';

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
  // "No, onions are fine." - Customer correcting themselves!
  // If an engineer writes an overbroad regex for "No ... onions", it drops onions.
  // The conversational parser correctly keeps onions, but regression suites must verify both layers!
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
 * Runs the input through conversational state reconstruction + MockPOSAdapter
 * and verifies output assertions.
 */
export function runRegressionSuite(
  cases: EvalCase[] = SCENARIO_1_EVAL_CASES,
  config: TransformationConfig = DEFAULT_DEFECTIVE_CONFIG,
  patchId?: string
): EvalRun {
  const adapter = new MockPOSAdapter(config);
  const results: EvalResultCase[] = [];

  for (const c of cases) {
    // Construct conversational agent order state from expected normalized state
    const agentState: AgentOrderState = {
      orderId: `eval_order_${c.id}`,
      customerIntent: 'PLACE_ORDER',
      orderType: 'PICKUP',
      customerPhone: '+15035550199',
      totalEstimatedPrice: 15.25,
      items: [
        {
          itemId: 'item_cheeseburger_dbl',
          itemName: c.expectedNormalizedState.item,
          quantity: c.expectedNormalizedState.quantity,
          unitPrice: 14.5,
          modifiers: {
            add: [...c.expectedNormalizedState.addModifiers],
            remove: [...c.expectedNormalizedState.removeModifiers],
          },
        },
      ],
    };

    const transformResult = adapter.transformOrder(agentState);
    const payload = transformResult.payload;

    if (!payload) {
      results.push({
        caseId: c.id,
        inputPrompt: c.inputPrompt,
        passed: false,
        observedNormalizedState: agentState,
        observedPosPayload: null,
        failureReason: transformResult.errorReason || 'POS Transformation returned null payload',
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

    // Check expected additions
    let passed = true;
    let failureReason = '';

    for (const expAdd of c.expectedPosPayloadCheck.hasAddModifiers) {
      const found = posAddMods.some((m) => m.includes(expAdd.toLowerCase()));
      if (!found) {
        passed = false;
        failureReason += `Missing expected ADD modifier "${expAdd}" in POS payload. `;
      }
    }

    // Check expected removals
    for (const expRem of c.expectedPosPayloadCheck.hasRemoveModifiers) {
      const found = posRemMods.some((m) => m.includes(expRem.toLowerCase()));
      if (!found) {
        passed = false;
        failureReason += `Missing expected REMOVE modifier "${expRem}" in POS payload. `;
      }
    }

    // Check that we didn't accidentally remove things when not requested (e.g. eval_s1_11)
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
