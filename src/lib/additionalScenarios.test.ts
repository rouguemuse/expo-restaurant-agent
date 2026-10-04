import { describe, it, expect } from 'vitest';
import { MockPOSAdapter, DEFAULT_DEFECTIVE_CONFIG, PATCHED_CONFIG } from '@/lib/posAdapter';
import { AgentOrderState } from '@/types';

describe('Additional Scenarios: Deterministic Logic', () => {
  // Scenario 2: Half-and-Half Pizza
  it('Scenario 2: Unpatched adapter flattens half-and-half toppings to whole pie, patched separates them', () => {
    const halfAndHalfState: AgentOrderState = {
      orderId: 'ord_sc2_test',
      customerIntent: 'PLACE_ORDER',
      orderType: 'PICKUP',
      customerPhone: '+15035550244',
      totalEstimatedPrice: 23.0,
      items: [
        {
          itemId: 'item_pizza_large_custom',
          itemName: 'Large 16" Custom Pizza',
          quantity: 1,
          unitPrice: 21.0,
          modifiers: {
            add: [],
            remove: [],
            halfOneAdd: ['Pepperoni'],
            halfTwoAdd: ['Cremini Mushrooms'],
          },
        },
      ],
    };

    // Unpatched: Whole fractions assigned
    const unpatched = new MockPOSAdapter(DEFAULT_DEFECTIVE_CONFIG);
    const unpatchedRes = unpatched.transformOrder(halfAndHalfState);
    expect(unpatchedRes.success).toBe(true);
    const unpatchedMods = unpatchedRes.payload!.lineItems[0].modifiers;
    expect(unpatchedMods.every((m) => m.targetFraction === 'WHOLE')).toBe(true);

    // Patched: Fractional splits preserved
    const patched = new MockPOSAdapter(PATCHED_CONFIG);
    const patchedRes = patched.transformOrder(halfAndHalfState);
    expect(patchedRes.success).toBe(true);
    const patchedMods = patchedRes.payload!.lineItems[0].modifiers;
    expect(patchedMods.some((m) => m.targetFraction === 'FIRST_HALF')).toBe(true);
    expect(patchedMods.some((m) => m.targetFraction === 'SECOND_HALF')).toBe(true);
  });

  // Scenario 3: Temporal Menu Availability
  it('Scenario 3: Enforces availability window for time-restricted items', () => {
    const lunchState: AgentOrderState = {
      orderId: 'ord_sc3_test',
      customerIntent: 'PLACE_ORDER',
      orderType: 'PICKUP',
      customerPhone: '+15035550882',
      totalEstimatedPrice: 9.95,
      items: [
        {
          itemId: 'item_lunch_special_slice_combo',
          itemName: 'Lunch Special: 2 Slices & Soda',
          quantity: 1,
          unitPrice: 9.95,
          modifiers: { add: [], remove: [] },
        },
      ],
    };

    // Unpatched ignores hours: passes even at 8:15 PM (20:15 UTC)
    const unpatched = new MockPOSAdapter(DEFAULT_DEFECTIVE_CONFIG);
    const unpatchedRes = unpatched.transformOrder(lunchState, '2026-10-03T20:15:00Z');
    expect(unpatchedRes.success).toBe(true);

    // Patched strictly rejects lunch special after 3:00 PM (15:00)
    const patched = new MockPOSAdapter(PATCHED_CONFIG);
    const patchedRes = patched.transformOrder(lunchState, '2026-10-03T20:15:00Z');
    expect(patchedRes.success).toBe(false);
    expect(patchedRes.errorReason).toContain('ITEM_UNAVAILABLE_AT_HOURS');
  });

  // Scenario 7: Webhook Retry Idempotency
  it('Scenario 7: Prevents duplicate order creation when retry occurs with same orderId', () => {
    const orderState: AgentOrderState = {
      orderId: 'ord_sc7_idempotent_test',
      customerIntent: 'PLACE_ORDER',
      orderType: 'PICKUP',
      customerPhone: '+15035550419',
      totalEstimatedPrice: 25.0,
      items: [
        {
          itemId: 'item_cheeseburger_dbl',
          itemName: 'Double Cheeseburger',
          quantity: 1,
          unitPrice: 14.5,
          modifiers: { add: [], remove: [] },
        },
      ],
    };

    // Unpatched: allows duplicate submission
    const unpatched = new MockPOSAdapter(DEFAULT_DEFECTIVE_CONFIG);
    const firstRes = unpatched.transformOrder(orderState);
    const retryRes = unpatched.transformOrder(orderState);
    expect(firstRes.success).toBe(true);
    expect(retryRes.success).toBe(true); // Duplicate allowed in bug!

    // Patched: rejects duplicate submission
    const patched = new MockPOSAdapter(PATCHED_CONFIG);
    const patchedFirst = patched.transformOrder(orderState);
    const patchedRetry = patched.transformOrder(orderState);
    expect(patchedFirst.success).toBe(true);
    expect(patchedRetry.success).toBe(false);
    expect(patchedRetry.isDuplicateRejected).toBe(true);
  });
});
