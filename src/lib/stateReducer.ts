/**
 * Multi-Turn Conversational Order State Reducer (Scenario 4)
 *
 * Implements deterministic multi-turn dialog state mutation:
 * Turn 1: "Two pepperoni pizzas." -> quantity: 2
 * Turn 2: "Actually make that three." -> quantity: 3
 * Turn 3: "Scratch that, make it four." -> quantity: 4
 * Turn 4: "I need one more." -> quantity += 1
 */

import { AgentOrderState, AgentOrderItem } from '@/types';

export interface StateTransitionResult {
  updatedState: AgentOrderState;
  slotMutated: string;
  previousValue: unknown;
  newValue: unknown;
  verbalConfirmationText: string;
}

export function applyTurn(
  currentState: AgentOrderState,
  utterance: string,
  enableCorrectionHandling: boolean = true
): StateTransitionResult {
  const text = utterance.trim();
  const lower = text.toLowerCase();

  const clonedItems: AgentOrderItem[] = JSON.parse(JSON.stringify(currentState.items));
  const primaryItem = clonedItems[0] || {
    itemId: 'item_pizza_large_custom',
    itemName: 'Large Pepperoni Pizza',
    quantity: 1,
    unitPrice: 23.25,
    modifiers: { add: ['Pepperoni'], remove: [] },
  };

  const oldQuantity = primaryItem.quantity;
  let newQuantity = oldQuantity;
  let verbalConfirmation = `Got it, ${oldQuantity} ${primaryItem.itemName}.`;

  if (enableCorrectionHandling) {
    // 1. Absolute quantity replacement idioms
    const makeThatMatch = /(?:make\s+(?:that|it)\s+|change\s+(?:to\s+)?|actually\s+)(\d+|two|three|four|five)/i.exec(text);
    if (makeThatMatch) {
      const valStr = makeThatMatch[1].toLowerCase();
      const numMap: Record<string, number> = {
        '1': 1, 'one': 1,
        '2': 2, 'two': 2,
        '3': 3, 'three': 3,
        '4': 4, 'four': 4,
        '5': 5, 'five': 5,
      };
      if (numMap[valStr]) {
        newQuantity = numMap[valStr];
      }
    } else if (/\bone\s+more\b/i.test(lower) || /\badd\s+another\b/i.test(lower)) {
      newQuantity = oldQuantity + 1;
    } else if (/\bjust\s+(\d+|two|three|four)\b/i.test(lower)) {
      const match = /\bjust\s+(\d+|two|three|four)\b/i.exec(lower);
      if (match) {
        const numMap: Record<string, number> = {
          '1': 1, 'one': 1, '2': 2, 'two': 2, '3': 3, 'three': 3, '4': 4, 'four': 4,
        };
        if (numMap[match[1]]) newQuantity = numMap[match[1]];
      }
    }

    primaryItem.quantity = newQuantity;
    verbalConfirmation = `Got it, updated to ${newQuantity} ${primaryItem.itemName}.`;
  } else {
    // DEFECTIVE IMPLEMENTATION (Scenario 4 Unpatched Reproduction):
    // Dialog agent verbally confirms the new number from the NLU slot,
    // but the state machine fails to mutate `orderState.items[0].quantity`!
    const makeThatMatch = /(?:make\s+(?:that|it)\s+|actually\s+)(\d+|two|three|four|five)/i.exec(text);
    const spokenNum = makeThatMatch ? makeThatMatch[1] : oldQuantity;
    verbalConfirmation = `Got it, ${spokenNum} ${primaryItem.itemName}.`;
    // Bug: primaryItem.quantity remains oldQuantity!
  }

  clonedItems[0] = primaryItem;

  const totalEstimatedPrice = primaryItem.unitPrice * primaryItem.quantity;

  const updatedState: AgentOrderState = {
    ...currentState,
    items: clonedItems,
    totalEstimatedPrice,
  };

  return {
    updatedState,
    slotMutated: 'items[0].quantity',
    previousValue: oldQuantity,
    newValue: primaryItem.quantity,
    verbalConfirmationText: verbalConfirmation,
  };
}
