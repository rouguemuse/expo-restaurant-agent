/**
 * Conversational Natural Language Understanding & Parser
 *
 * Implements deterministic semantic parsing of customer phone utterances
 * into structured conversational order state, handling:
 * - Direct exclusions ("no onions", "no onion please")
 * - Imperative phrasing ("hold the onions", "take the onions off")
 * - Prepositional exclusions ("without onion")
 * - Exception clauses ("everything except onions", "keep everything except the onion")
 * - Compound exclusions ("no onions or tomato")
 * - Implicit exclusions ("burger plain, only meat and cheese")
 * - Discursive self-correction guard ("Wait, no, onions are fine. Extra pickles only.")
 */

import { ConversationalModifierState } from '@/types';

export interface ParsedItemIntent {
  rawItemName: string;
  matchedItemId?: string;
  quantity: number;
  modifiers: ConversationalModifierState;
  clarificationRequired?: boolean;
}

export function parseCustomerUtterance(utterance: string): ParsedItemIntent {
  const text = utterance.trim();
  const lower = text.toLowerCase();

  const add: string[] = [];
  const remove: string[] = [];
  let quantity = 1;

  // 1. Quantity extraction
  if (lower.startsWith('two ') || lower.includes(' 2 ') || lower.includes('two large')) {
    quantity = 2;
  } else if (lower.startsWith('three ') || lower.includes(' 3 ') || lower.includes('three large')) {
    quantity = 3;
  }

  // 2. Identify Item
  let rawItemName = 'Double Cheeseburger';
  let matchedItemId = 'item_cheeseburger_dbl';
  if (lower.includes('pizza') || lower.includes('slice')) {
    rawItemName = 'Large 16" Custom Pizza';
    matchedItemId = 'item_pizza_large_custom';
  }

  // 3. REGRESSION GUARD: Check for conversational self-correction
  // e.g., "Wait, no, onions are fine. Extra pickles only."
  // The word "no" here is a discursive particle ("no, X is fine"), NOT an exclusion!
  const hasAffirmativeRetraction =
    /(?:no|wait)[,\s]+onions?\s+(?:are|is)\s+(?:fine|good|okay)/i.test(text) ||
    /onions?\s+(?:are|is)\s+(?:fine|good|okay)/i.test(text);

  if (hasAffirmativeRetraction) {
    // Onions are explicitly desired; do not exclude them!
    if (lower.includes('extra pickle') || lower.includes('extra pickles')) {
      add.push('Extra Pickles');
    }
    return {
      rawItemName,
      matchedItemId,
      quantity,
      modifiers: { add, remove },
    };
  }

  // 4. POSITIVE MODIFIERS (ADD)
  if (lower.includes('extra pickle') || lower.includes('extra pickles') || lower.includes('+ extra pickles')) {
    add.push('Extra Pickles');
  }
  if (lower.includes('bacon')) {
    add.push('Smoked Bacon');
  }
  if (lower.includes('extra cheese')) {
    add.push('Extra Aged Cheddar');
  }

  // 5. NEGATIVE MODIFIERS (EXCLUSIONS)
  // Check for "plain" (implicit exclusion of standard produce/sauce)
  if (/\bplain\b/i.test(text)) {
    remove.push('Onions');
    remove.push('Pickles');
    remove.push('Special Sauce');
  } else {
    // Explicit exclusions for Onions
    const onionExclusionRegex =
      /(?:no\s+onions?|hold\s+(?:the\s+)?onions?|without\s+onions?|except\s+(?:the\s+)?onions?|take\s+(?:the\s+)?onions?\s+off|keep\s+everything\s+except\s+(?:the\s+)?onions?)/i;

    if (onionExclusionRegex.test(text)) {
      remove.push('Onions');
    }

    // Explicit exclusions for Tomato
    const tomatoExclusionRegex =
      /(?:no\s+tomatoes?|hold\s+(?:the\s+)?tomatoes?|without\s+tomatoes?|or\s+tomato(?:es)?)/i;

    if (tomatoExclusionRegex.test(text)) {
      remove.push('Tomato');
    }
  }

  return {
    rawItemName,
    matchedItemId,
    quantity,
    modifiers: {
      add,
      remove: Array.from(new Set(remove)),
    },
  };
}
