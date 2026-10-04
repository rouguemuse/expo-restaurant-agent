import { describe, it, expect } from 'vitest';
import { MockPOSAdapter, DEFAULT_DEFECTIVE_CONFIG, PATCHED_CONFIG } from '@/lib/posAdapter';
import { runRegressionSuite, SCENARIO_1_EVAL_CASES } from '@/lib/evalEngine';
import { AgentOrderState } from '@/types';

describe('Scenario 1: The Lost Modifier (Deterministic Behavior)', () => {
  const baseOrderState: AgentOrderState = {
    orderId: 'ord_test_01',
    customerIntent: 'PLACE_ORDER',
    orderType: 'PICKUP',
    customerPhone: '+15035550199',
    totalEstimatedPrice: 15.25,
    items: [
      {
        itemId: 'item_cheeseburger_dbl',
        itemName: 'Double Cheeseburger',
        quantity: 1,
        unitPrice: 14.5,
        modifiers: {
          add: ['Extra Pickles'],
          remove: ['Onions'],
        },
      },
    ],
  };

  it('proves the unpatched POS adapter drops the negative modifier', () => {
    const unpatchedAdapter = new MockPOSAdapter(DEFAULT_DEFECTIVE_CONFIG);
    const result = unpatchedAdapter.transformOrder(baseOrderState);

    expect(result.success).toBe(true);
    expect(result.payload).toBeDefined();

    const lineItem = result.payload!.lineItems[0];
    const addMods = lineItem.modifiers.filter((m) => m.action === 'ADD');
    const remMods = lineItem.modifiers.filter((m) => m.action === 'REMOVE');

    // Positive modifier is present
    expect(addMods.length).toBe(1);
    expect(addMods[0].name).toContain('Pickles');

    // Negative modifier is LOST (The exact bug reported!)
    expect(remMods.length).toBe(0);
  });

  it('proves the patched POS adapter preserves the negative modifier', () => {
    const patchedAdapter = new MockPOSAdapter(PATCHED_CONFIG);
    const result = patchedAdapter.transformOrder(baseOrderState);

    expect(result.success).toBe(true);
    expect(result.payload).toBeDefined();

    const lineItem = result.payload!.lineItems[0];
    const addMods = lineItem.modifiers.filter((m) => m.action === 'ADD');
    const remMods = lineItem.modifiers.filter((m) => m.action === 'REMOVE');

    // Both modifiers are preserved
    expect(addMods.length).toBe(1);
    expect(remMods.length).toBe(1);
    expect(remMods[0].name).toContain('Onions');
    expect(remMods[0].action).toBe('REMOVE');
  });

  it('runs deterministic regression suite and demonstrates measurable improvement', () => {
    // 1. Before patch
    const beforeRun = runRegressionSuite(SCENARIO_1_EVAL_CASES, DEFAULT_DEFECTIVE_CONFIG);
    // In unpatched mode, only case 11 passes because it had no remove modifiers
    expect(beforeRun.passRatePercent).toBeLessThan(20);
    expect(beforeRun.passedCases).toBe(1);

    // 2. After patch
    const afterRun = runRegressionSuite(SCENARIO_1_EVAL_CASES, PATCHED_CONFIG, 'patch_mod_01');
    expect(afterRun.passedCases).toBe(SCENARIO_1_EVAL_CASES.length);
    expect(afterRun.passRatePercent).toBe(100);
  });
});
