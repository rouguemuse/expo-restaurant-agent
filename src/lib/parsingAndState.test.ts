import { describe, it, expect } from 'vitest';
import { parseCustomerUtterance } from '@/lib/utteranceParser';
import { applyTurn } from '@/lib/stateReducer';
import { AgentOrderState } from '@/types';

describe('Conversational NLU & State Reducer (Real Parsing Execution)', () => {
  it('correctly parses compound negative and positive modifiers', () => {
    const res = parseCustomerUtterance('Double cheeseburger, no onions, extra pickles.');
    expect(res.rawItemName).toBe('Double Cheeseburger');
    expect(res.modifiers.add).toContain('Extra Pickles');
    expect(res.modifiers.remove).toContain('Onions');
  });

  it('correctly parses colloquial restaurant exclusions: hold the onions, plain, without', () => {
    const hold = parseCustomerUtterance('Hold the onions on that cheeseburger.');
    expect(hold.modifiers.remove).toContain('Onions');

    const without = parseCustomerUtterance('Double cheeseburger without onion.');
    expect(without.modifiers.remove).toContain('Onions');

    const plain = parseCustomerUtterance('Burger plain, only meat and cheese.');
    expect(plain.modifiers.remove).toContain('Onions');
    expect(plain.modifiers.remove).toContain('Pickles');
    expect(plain.modifiers.remove).toContain('Special Sauce');
  });

  it('regression guard: distinguishes discursive "no" from modifier exclusion', () => {
    const guard = parseCustomerUtterance('Wait, no, onions are fine. Extra pickles only.');
    expect(guard.modifiers.add).toContain('Extra Pickles');
    // Onions must NOT be removed!
    expect(guard.modifiers.remove).not.toContain('Onions');
    expect(guard.modifiers.remove.length).toBe(0);
  });

  it('Scenario 4: applies multi-turn conversational corrections accurately', () => {
    const initialState: AgentOrderState = {
      orderId: 'ord_sc4_multiturn',
      customerIntent: 'PLACE_ORDER',
      orderType: 'PICKUP',
      customerPhone: '+15035550991',
      totalEstimatedPrice: 46.5,
      items: [
        {
          itemId: 'item_pizza_large_custom',
          itemName: 'Large Pepperoni Pizza',
          quantity: 2,
          unitPrice: 23.25,
          modifiers: { add: ['Pepperoni'], remove: [] },
        },
      ],
    };

    // Unpatched: Dialog agent speaks, but state is not mutated
    const defectiveTransition = applyTurn(initialState, 'Actually make that three.', false);
    expect(defectiveTransition.updatedState.items[0].quantity).toBe(2); // Still 2!
    expect(defectiveTransition.verbalConfirmationText).toContain('three');

    // Patched: State is properly updated to 3
    const patchedTransition = applyTurn(initialState, 'Actually make that three.', true);
    expect(patchedTransition.updatedState.items[0].quantity).toBe(3);
    expect(patchedTransition.verbalConfirmationText).toContain('3');
  });
});
