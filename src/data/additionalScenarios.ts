import { Incident, Call, Trace } from '@/types';

// SCENARIO 2: Half-and-Half Pizza State
export const SCENARIO_2_INCIDENT: Incident = {
  id: 'INC-8495',
  title: 'Half-and-half pizza modifier split flattened into whole-pizza coverage',
  severity: 'MEDIUM',
  restaurantId: 'rest_sidecar_01',
  failureCategory: 'POS MAPPING',
  affectedCallsCount: 5,
  firstDetected: '2026-10-03T19:30:00Z',
  lastDetected: '2026-10-04T01:10:00Z',
  reproductionRatePercent: 100,
  estimatedRevenueExposure: 185.0,
  status: 'INVESTIGATING',
  owner: 'Forward Deployed Engineering',
  scenarioId: 'scenario_2_half_and_half',
  primaryTraceId: 'tr_sc2_001',
  description:
    'Customer ordered "Large pizza, half pepperoni and half mushroom". Conversational state structured separate half splits (halfOneAdd=["Pepperoni"], halfTwoAdd=["Cremini Mushrooms"]). POS adapter flattened both toppings into whole-pizza modifiers. Kitchen prepared pizza with pepperoni and mushrooms across the entire pie.',
  expectedBehavior:
    'POS line items must preserve targetFraction="FIRST_HALF" and "SECOND_HALF" with 50% price delta calculations.',
  observedBehavior:
    'POS line items converted both toppings to targetFraction="WHOLE" and charged 100% full modifier prices.',
  rootCauseHypothesis:
    'Adapter lacked fractional topping modifier grouping logic and defaulted all nested half toppings to whole pie.',
  operationalImpact: {
    affectedOrdersCount: 5,
    totalOrdersAnalyzed: 142,
    estimatedDirectRemakeCost: 105.0, // 5 pies remade
    estimatedGuestExperienceExposureRevenue: 185.0,
    confidence: 'HIGH',
    evidenceTraceIds: ['tr_sc2_001'],
    costCalculationExplanation: '5 customer calls complaining about mushroom contamination on non-mushroom half.',
  },
  operatorCommunicationDraft:
    'We corrected the half-and-half topping mapping where split pizzas were sending toppings as whole-pizza items to the make-line display. Split configurations now show clear 1st Half / 2nd Half tags on kitchen tickets.',
};

export const SCENARIO_2_TRACE: Trace = {
  traceId: 'tr_sc2_001',
  callId: 'call_sc2_001',
  scenarioId: 'scenario_2_half_and_half',
  startedAt: '2026-10-04T00:20:10.000Z',
  completedAt: '2026-10-04T00:20:32.000Z',
  totalDurationMs: 22000,
  status: 'ERROR',
  events: [
    {
      id: 'sc2_evt_01',
      traceId: 'tr_sc2_001',
      name: 'USER_UTTERANCE',
      timestamp: '2026-10-04T00:20:12.000Z',
      durationMs: 2100,
      status: 'SUCCESS',
      input: {},
      output: { rawTranscript: 'Large pizza, half pepperoni and half mushroom.' },
      metadata: { component: 'asr_whisper_streaming' },
    },
    {
      id: 'sc2_evt_02',
      traceId: 'tr_sc2_001',
      name: 'MODIFIER_PARSED',
      timestamp: '2026-10-04T00:20:14.200Z',
      durationMs: 38,
      status: 'SUCCESS',
      input: { utterance: 'half pepperoni and half mushroom' },
      output: {
        fractionalSplit: true,
        halfOneAdd: ['Pepperoni'],
        halfTwoAdd: ['Cremini Mushrooms'],
      },
      metadata: { component: 'modifier_resolution_engine' },
    },
    {
      id: 'sc2_evt_03',
      traceId: 'tr_sc2_001',
      name: 'ORDER_STATE_UPDATED',
      timestamp: '2026-10-04T00:20:14.250Z',
      durationMs: 14,
      status: 'SUCCESS',
      input: {},
      output: {
        item: 'Large 16" Custom Pizza',
        halfOneAdd: ['Pepperoni'],
        halfTwoAdd: ['Cremini Mushrooms'],
      },
      metadata: { component: 'conversational_state_manager' },
    },
    {
      id: 'sc2_evt_04',
      traceId: 'tr_sc2_001',
      name: 'POS_MODIFIER_MAPPED',
      timestamp: '2026-10-04T00:20:25.100Z',
      durationMs: 22,
      status: 'ERROR',
      input: { halfOneAdd: ['Pepperoni'], halfTwoAdd: ['Cremini Mushrooms'] },
      output: {
        posModifiers: [
          { name: 'Pepperoni', targetFraction: 'WHOLE', priceDelta: 2.25 },
          { name: 'Cremini Mushrooms', targetFraction: 'WHOLE', priceDelta: 1.75 },
        ],
      },
      metadata: {
        component: 'pos_serializer',
        hasDefectHere: true,
        defectExplanation:
          'POS adapter lacked targetFraction awareness and mapped both half toppings as full pie additions!',
      },
    },
    {
      id: 'sc2_evt_05',
      traceId: 'tr_sc2_001',
      name: 'ORDER_SUBMITTED',
      timestamp: '2026-10-04T00:20:26.500Z',
      durationMs: 300,
      status: 'SUCCESS',
      input: {},
      output: { ticketId: 'TKT-9972' },
      metadata: { component: 'pos_api_client' },
    },
  ],
};

export const SCENARIO_2_CALL: Call = {
  id: 'call_sc2_001',
  restaurantId: 'rest_sidecar_01',
  customerPhone: '+15035550244',
  startedAt: '2026-10-04T00:20:10.000Z',
  durationSeconds: 22,
  traceId: 'tr_sc2_001',
  scenarioTag: 'scenario_2_half_and_half',
  outcome: 'ORDER_DEFECT',
  orderState: {
    orderId: 'ord_sc2_001',
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
  },
  transcript: [
    { speaker: 'user', text: "Can I get a large pizza, half pepperoni and half mushroom please?", timestamp: '00:03' },
    { speaker: 'agent', text: "Sure! Large 16-inch pizza with pepperoni on the first half and cremini mushrooms on the second half. Anything else?", timestamp: '00:06' },
    { speaker: 'user', text: "No, that's it.", timestamp: '00:15' },
    { speaker: 'agent', text: "Order confirmed for pickup. See you in 25 minutes!", timestamp: '00:18' },
  ],
};

// SCENARIO 3: Temporal Menu Availability
export const SCENARIO_3_INCIDENT: Incident = {
  id: 'INC-8501',
  title: 'Agent offered expired Lunch Special pricing after 3:00 PM availability window',
  severity: 'MEDIUM',
  restaurantId: 'rest_sidecar_01',
  failureCategory: 'MENU KNOWLEDGE',
  affectedCallsCount: 4,
  firstDetected: '2026-10-03T20:15:00Z',
  lastDetected: '2026-10-03T21:40:00Z',
  reproductionRatePercent: 100,
  estimatedRevenueExposure: 96.0,
  status: 'INVESTIGATING',
  owner: 'Forward Deployed Engineering',
  scenarioId: 'scenario_3_temporal_menu',
  primaryTraceId: 'tr_sc3_001',
  description:
    'Customer called at 8:15 PM requesting the "Lunch Special: 2 Slices & Soda". Agent offered and confirmed the order at $9.95 despite lunch cutoff being 3:00 PM. Root cause is menu lookup tool returning all active items without checking temporal availability window metadata.',
  expectedBehavior:
    'Agent should inform caller that lunch special is available 11:00 AM - 3:00 PM and offer dinner slices or custom pie.',
  observedBehavior:
    'Agent confirmed lunch special at dinner time; kitchen manager had to manually reject the ticket in POS.',
  rootCauseHypothesis:
    'RAG/Menu lookup tool filtered by `available: true` but ignored `availabilityWindow: { startHour: 11, endHour: 15 }`.',
  operationalImpact: {
    affectedOrdersCount: 4,
    totalOrdersAnalyzed: 142,
    estimatedDirectRemakeCost: 40.0,
    estimatedGuestExperienceExposureRevenue: 96.0,
    confidence: 'HIGH',
    evidenceTraceIds: ['tr_sc3_001'],
    costCalculationExplanation: 'Kitchen disputes when diners expect $9.95 special at 8 PM.',
  },
  operatorCommunicationDraft:
    'We resolved an issue where the phone agent offered the 11am-3pm lunch special during evening dinner hours. The menu availability filter now verifies the store operating schedule before offering time-restricted specials.',
};

export const SCENARIO_3_TRACE: Trace = {
  traceId: 'tr_sc3_001',
  callId: 'call_sc3_001',
  scenarioId: 'scenario_3_temporal_menu',
  startedAt: '2026-10-03T20:15:00.000Z',
  completedAt: '2026-10-03T20:15:28.000Z',
  totalDurationMs: 28000,
  status: 'ERROR',
  events: [
    {
      id: 'sc3_evt_01',
      traceId: 'tr_sc3_001',
      name: 'USER_UTTERANCE',
      timestamp: '2026-10-03T20:15:02.000Z',
      durationMs: 1200,
      status: 'SUCCESS',
      input: {},
      output: { rawTranscript: 'Hey, can I still get that lunch special with the two slices and a drink?' },
      metadata: { component: 'asr_whisper_streaming' },
    },
    {
      id: 'sc3_evt_02',
      traceId: 'tr_sc3_001',
      name: 'MENU_LOOKUP',
      timestamp: '2026-10-03T20:15:03.500Z',
      durationMs: 40,
      status: 'ERROR',
      input: { query: 'lunch special', callTimeIso: '2026-10-03T20:15:00Z' },
      output: {
        matchedItem: 'Lunch Special: 2 Slices & Soda',
        price: 9.95,
        availabilityWindow: { startHour: 11, endHour: 15 },
        hourAtCall: 20, // 8 PM!
      },
      metadata: {
        component: 'menu_knowledge_graph',
        hasDefectHere: true,
        defectExplanation:
          'TEMPORAL FILTER GAP: Menu lookup returned item as available without validating current hour (20:00) against window (11:00-15:00).',
      },
    },
    {
      id: 'sc3_evt_03',
      traceId: 'tr_sc3_001',
      name: 'AGENT_RESPONSE',
      timestamp: '2026-10-03T20:15:04.200Z',
      durationMs: 1100,
      status: 'WARNING',
      input: {},
      output: { text: "Yes, you can! The 2 Slices and Soda combo is $9.95. What slices would you like?" },
      metadata: { component: 'dialog_policy' },
    },
  ],
};

export const SCENARIO_3_CALL: Call = {
  id: 'call_sc3_001',
  restaurantId: 'rest_sidecar_01',
  customerPhone: '+15035550882',
  startedAt: '2026-10-03T20:15:00.000Z',
  durationSeconds: 28,
  traceId: 'tr_sc3_001',
  scenarioTag: 'scenario_3_temporal_menu',
  outcome: 'ORDER_DEFECT',
  orderState: {
    orderId: 'ord_sc3_001',
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
  },
  transcript: [
    { speaker: 'user', text: "Hey, can I still get that lunch special with the two slices and a drink?", timestamp: '00:02' },
    { speaker: 'agent', text: "Yes, you can! The 2 Slices and Soda combo is $9.95. What slices would you like?", timestamp: '00:04' },
    { speaker: 'user', text: "Pepperoni and cheese please.", timestamp: '00:10' },
    { speaker: 'agent', text: "Great, order is in. See you shortly!", timestamp: '00:15' },
  ],
};

// SCENARIO 4: Multi-Turn Quantity State
export const SCENARIO_4_INCIDENT: Incident = {
  id: 'INC-8508',
  title: 'Multi-turn quantity correction ("Actually make that three") ignored in final state',
  severity: 'HIGH',
  restaurantId: 'rest_sidecar_01',
  failureCategory: 'CONVERSATION STATE',
  affectedCallsCount: 6,
  firstDetected: '2026-10-03T17:10:00Z',
  lastDetected: '2026-10-04T02:00:00Z',
  reproductionRatePercent: 100,
  estimatedRevenueExposure: 252.0,
  status: 'INVESTIGATING',
  owner: 'Forward Deployed Engineering',
  scenarioId: 'scenario_4_quantity_state',
  primaryTraceId: 'tr_sc4_001',
  description:
    'Customer ordered two pepperoni pizzas, then clarified "Actually make that three". Agent verbally confirmed three pizzas ("Got it, three pepperoni pizzas"), but conversational state manager failed to execute the quantity delta transition, submitting quantity: 2 to POS.',
  expectedBehavior:
    'AgentOrderState.items[0].quantity must update from 2 to 3 upon user revision turn.',
  observedBehavior:
    'Conversational state manager retained initial slot value (2) because turn-based update handler lacked quantity replacement semantic.',
  rootCauseHypothesis:
    'State machine parser treated quantity modification as an unhandled slot-fill rather than updating existing line item quantity.',
  operationalImpact: {
    affectedOrdersCount: 6,
    totalOrdersAnalyzed: 142,
    estimatedDirectRemakeCost: 126.0,
    estimatedGuestExperienceExposureRevenue: 252.0,
    confidence: 'HIGH',
    evidenceTraceIds: ['tr_sc4_001'],
    costCalculationExplanation: 'Customers arrived at restaurant expecting 3 pizzas and had to wait 20 minutes for a third pie.',
  },
  operatorCommunicationDraft:
    'We patched a conversational state tracking bug where verbal corrections to pizza quantities (e.g. "make that three instead of two") were recognized verbally by the voice agent but failed to update the final ticket quantity sent to your kitchen.',
};

export const SCENARIO_4_TRACE: Trace = {
  traceId: 'tr_sc4_001',
  callId: 'call_sc4_001',
  scenarioId: 'scenario_4_quantity_state',
  startedAt: '2026-10-03T17:10:00.000Z',
  completedAt: '2026-10-03T17:10:35.000Z',
  totalDurationMs: 35000,
  status: 'ERROR',
  events: [
    {
      id: 'sc4_evt_01',
      traceId: 'tr_sc4_001',
      name: 'USER_UTTERANCE',
      timestamp: '2026-10-03T17:10:04.000Z',
      durationMs: 1400,
      status: 'SUCCESS',
      input: {},
      output: { rawTranscript: 'Two pepperoni pizzas.' },
      metadata: { component: 'asr_whisper_streaming' },
    },
    {
      id: 'sc4_evt_02',
      traceId: 'tr_sc4_001',
      name: 'ORDER_STATE_UPDATED',
      timestamp: '2026-10-03T17:10:06.000Z',
      durationMs: 15,
      status: 'SUCCESS',
      input: {},
      output: { items: [{ name: 'Pepperoni Pizza', quantity: 2 }] },
      metadata: { component: 'conversational_state_manager' },
    },
    {
      id: 'sc4_evt_03',
      traceId: 'tr_sc4_001',
      name: 'USER_UTTERANCE',
      timestamp: '2026-10-03T17:10:14.000Z',
      durationMs: 1100,
      status: 'SUCCESS',
      input: {},
      output: { rawTranscript: 'Actually make that three.' },
      metadata: { component: 'asr_whisper_streaming' },
    },
    {
      id: 'sc4_evt_04',
      traceId: 'tr_sc4_001',
      name: 'AGENT_RESPONSE',
      timestamp: '2026-10-03T17:10:16.000Z',
      durationMs: 900,
      status: 'SUCCESS',
      input: {},
      output: { text: 'Got it, three pepperoni pizzas.' },
      metadata: { component: 'dialog_policy' },
    },
    {
      id: 'sc4_evt_05',
      traceId: 'tr_sc4_001',
      name: 'ORDER_STATE_UPDATED',
      timestamp: '2026-10-03T17:10:16.200Z',
      durationMs: 25,
      status: 'ERROR',
      input: { utterance: 'Actually make that three' },
      output: { items: [{ name: 'Pepperoni Pizza', quantity: 2 }] }, // Stale quantity!
      metadata: {
        component: 'conversational_state_manager',
        hasDefectHere: true,
        defectExplanation:
          'STATE TRANSITION FAILURE: Slot modification "make that 3" parsed in dialog agent but order state mutation was dropped. Retained quantity: 2.',
      },
    },
    {
      id: 'sc4_evt_06',
      traceId: 'tr_sc4_001',
      name: 'ORDER_SUBMITTED',
      timestamp: '2026-10-03T17:10:30.000Z',
      durationMs: 200,
      status: 'WARNING',
      input: {},
      output: { ticketItems: [{ name: 'Pepperoni Pizza', qty: 2 }] },
      metadata: { component: 'pos_api_client' },
    },
  ],
};

export const SCENARIO_4_CALL: Call = {
  id: 'call_sc4_001',
  restaurantId: 'rest_sidecar_01',
  customerPhone: '+15035550991',
  startedAt: '2026-10-03T17:10:00.000Z',
  durationSeconds: 35,
  traceId: 'tr_sc4_001',
  scenarioTag: 'scenario_4_quantity_state',
  outcome: 'ORDER_DEFECT',
  orderState: {
    orderId: 'ord_sc4_001',
    customerIntent: 'PLACE_ORDER',
    orderType: 'PICKUP',
    customerPhone: '+15035550991',
    totalEstimatedPrice: 46.5,
    items: [
      {
        itemId: 'item_pizza_large_custom',
        itemName: 'Large Pepperoni Pizza',
        quantity: 2, // DEFECT: should be 3
        unitPrice: 23.25,
        modifiers: { add: ['Pepperoni'], remove: [] },
      },
    ],
  },
  transcript: [
    { speaker: 'user', text: "I'd like two large pepperoni pizzas.", timestamp: '00:04' },
    { speaker: 'agent', text: "Two large pepperoni pizzas. Anything else to add?", timestamp: '00:07' },
    { speaker: 'user', text: "Actually make that three pepperoni pizzas.", timestamp: '00:14' },
    { speaker: 'agent', text: "Got it, three pepperoni pizzas. Ready in 25 minutes!", timestamp: '00:17' },
  ],
};

// SCENARIO 5: Allergy Safety Policy Violation
export const SCENARIO_5_INCIDENT: Incident = {
  id: 'INC-8515',
  title: 'Severe allergen inquiry answered without safety verification or staff escalation',
  severity: 'CRITICAL',
  restaurantId: 'rest_sidecar_01',
  failureCategory: 'SAFETY',
  affectedCallsCount: 2,
  firstDetected: '2026-10-04T01:45:00Z',
  lastDetected: '2026-10-04T02:15:00Z',
  reproductionRatePercent: 100,
  estimatedRevenueExposure: 5000.0,
  status: 'INVESTIGATING',
  owner: 'FDE Safety & Compliance',
  scenarioId: 'scenario_5_allergy_safety',
  primaryTraceId: 'tr_sc5_001',
  description:
    'Customer asked: "Does your pesto have nuts? My daughter has a severe peanut and tree nut allergy." Agent hallucinated certainty, stating: "No, our pesto is made strictly with fresh basil and olive oil and is completely nut-free." In reality, house Genovese pesto contains crushed walnuts and pine nuts.',
  expectedBehavior:
    'Under Sidecar Pizza Co. allergensPolicy (strictEscalation: true), any inquiry regarding tree nuts/peanuts must immediately trigger staff escalation transfer or state ambiguity with refusal to guarantee safety.',
  observedBehavior:
    'Agent hallucinated a false negative answer without checking ingredients metadata or escalating to kitchen staff.',
  rootCauseHypothesis:
    'Allergen guardrail prompt was missing deterministic negative-constraint hook for unverified tree nuts.',
  operationalImpact: {
    affectedOrdersCount: 2,
    totalOrdersAnalyzed: 142,
    estimatedDirectRemakeCost: 0,
    estimatedGuestExperienceExposureRevenue: 5000.0,
    confidence: 'HIGH',
    evidenceTraceIds: ['tr_sc5_001'],
    costCalculationExplanation: 'Critical life-safety and brand liability exposure. Pesto contains pine nuts and walnuts.',
  },
  operatorCommunicationDraft:
    'We treated this as a critical incident. We deployed an allergen safety interceptor that forces an immediate warm handoff to restaurant staff whenever customers ask about tree nut or peanut allergens.',
};

export const SCENARIO_5_TRACE: Trace = {
  traceId: 'tr_sc5_001',
  callId: 'call_sc5_001',
  scenarioId: 'scenario_5_allergy_safety',
  startedAt: '2026-10-04T01:45:00.000Z',
  completedAt: '2026-10-04T01:45:20.000Z',
  totalDurationMs: 20000,
  status: 'ERROR',
  events: [
    {
      id: 'sc5_evt_01',
      traceId: 'tr_sc5_001',
      name: 'USER_UTTERANCE',
      timestamp: '2026-10-04T01:45:03.000Z',
      durationMs: 1800,
      status: 'SUCCESS',
      input: {},
      output: { rawTranscript: 'Does your pesto sandwich have nuts? My daughter has a severe tree nut allergy.' },
      metadata: { component: 'asr_whisper_streaming' },
    },
    {
      id: 'sc5_evt_02',
      traceId: 'tr_sc5_001',
      name: 'POLICY_VIOLATION_CHECK',
      timestamp: '2026-10-04T01:45:05.100Z',
      durationMs: 12,
      status: 'ERROR',
      input: { allergensPolicyStrict: true, allergenDetected: 'tree nuts' },
      output: { escalated: false },
      metadata: {
        component: 'safety_guardrail_policy',
        hasDefectHere: true,
        defectExplanation:
          'SAFETY VIOLATION: Store policy requires mandatory staff escalation for nut allergies. Agent failed to escalate.',
      },
    },
    {
      id: 'sc5_evt_03',
      traceId: 'tr_sc5_001',
      name: 'AGENT_RESPONSE',
      timestamp: '2026-10-04T01:45:06.500Z',
      durationMs: 1100,
      status: 'ERROR',
      input: {},
      output: { text: 'Our pesto is made fresh with basil, garlic, and olive oil, and does not contain nuts.' },
      metadata: { component: 'dialog_policy', hallucinationDetected: true },
    },
  ],
};

export const SCENARIO_5_CALL: Call = {
  id: 'call_sc5_001',
  restaurantId: 'rest_sidecar_01',
  customerPhone: '+15035550672',
  startedAt: '2026-10-04T01:45:00.000Z',
  durationSeconds: 20,
  traceId: 'tr_sc5_001',
  scenarioTag: 'scenario_5_allergy_safety',
  outcome: 'ORDER_DEFECT',
  orderState: {
    orderId: 'ord_sc5_001',
    customerIntent: 'MENU_INQUIRY',
    orderType: 'PICKUP',
    customerPhone: '+15035550672',
    totalEstimatedPrice: 0,
    items: [],
  },
  transcript: [
    { speaker: 'user', text: "Does your pesto sandwich have nuts? My daughter has a severe tree nut allergy.", timestamp: '00:03' },
    { speaker: 'agent', text: "Our pesto is made fresh with basil, garlic, and olive oil, and does not contain nuts.", timestamp: '00:06' },
    { speaker: 'user', text: "Okay good, thanks for confirming.", timestamp: '00:15' },
  ],
};

// SCENARIO 6: Delivery Zone
export const SCENARIO_6_INCIDENT: Incident = {
  id: 'INC-8520',
  title: 'Delivery order accepted for out-of-boundary ZIP code (97035)',
  severity: 'MEDIUM',
  restaurantId: 'rest_sidecar_01',
  failureCategory: 'CONFIGURATION',
  affectedCallsCount: 3,
  firstDetected: '2026-10-03T19:00:00Z',
  lastDetected: '2026-10-03T23:20:00Z',
  reproductionRatePercent: 100,
  estimatedRevenueExposure: 145.0,
  status: 'INVESTIGATING',
  owner: 'Forward Deployed Engineering',
  scenarioId: 'scenario_6_delivery_zone',
  primaryTraceId: 'tr_sc6_001',
  description:
    'Customer ordered delivery to ZIP 97035 (Lake Oswego - 11 miles away). Sidecar Pizza configuration limits delivery radius to 6.5 miles (ZIPs: 97201, 97202, 97204, 97205, 97209, 97214). Agent accepted delivery without validating ZIP against configured delivery service territory.',
  expectedBehavior:
    'Agent checks delivery address against configured ZIP list, rejects delivery if out of territory, and offers pickup instead.',
  observedBehavior:
    'Agent confirmed delivery to 97035. Restaurant driver arrived at kitchen unable to deliver 11 miles away during peak rush.',
  rootCauseHypothesis:
    'Delivery eligibility verification hook was omitted from telephony state machine intake flow.',
  operationalImpact: {
    affectedOrdersCount: 3,
    totalOrdersAnalyzed: 142,
    estimatedDirectRemakeCost: 75.0,
    estimatedGuestExperienceExposureRevenue: 145.0,
    confidence: 'HIGH',
    evidenceTraceIds: ['tr_sc6_001'],
    costCalculationExplanation: 'Cold food delivery complaints and $15 dispatch cancellation credits.',
  },
  operatorCommunicationDraft:
    'We enabled strict ZIP verification on inbound delivery orders. Delivery addresses outside your designated 6.5-mile boundary will now be offered convenient pickup rather than confirmed for delivery.',
};

export const SCENARIO_6_TRACE: Trace = {
  traceId: 'tr_sc6_001',
  callId: 'call_sc6_001',
  scenarioId: 'scenario_6_delivery_zone',
  startedAt: '2026-10-03T19:00:00.000Z',
  completedAt: '2026-10-03T19:00:25.000Z',
  totalDurationMs: 25000,
  status: 'ERROR',
  events: [
    {
      id: 'sc6_evt_01',
      traceId: 'tr_sc6_001',
      name: 'USER_UTTERANCE',
      timestamp: '2026-10-03T19:00:03.000Z',
      durationMs: 1500,
      status: 'SUCCESS',
      input: {},
      output: { rawTranscript: 'Can I get a large pepperoni pizza delivered to 4200 Meadows Rd in 97035?' },
      metadata: { component: 'asr_whisper_streaming' },
    },
    {
      id: 'sc6_evt_02',
      traceId: 'tr_sc6_001',
      name: 'POLICY_VIOLATION_CHECK',
      timestamp: '2026-10-03T19:00:05.000Z',
      durationMs: 10,
      status: 'ERROR',
      input: { zipCode: '97035', configuredZips: ['97201', '97202', '97204', '97205', '97209', '97214'] },
      output: { inZone: false },
      metadata: {
        component: 'delivery_radius_validator',
        hasDefectHere: true,
        defectExplanation:
          'CONFIGURATION DEFECT: ZIP 97035 is outside configured service boundary, but validator failed to block order.',
      },
    },
  ],
};

export const SCENARIO_6_CALL: Call = {
  id: 'call_sc6_001',
  restaurantId: 'rest_sidecar_01',
  customerPhone: '+15035550381',
  startedAt: '2026-10-03T19:00:00.000Z',
  durationSeconds: 25,
  traceId: 'tr_sc6_001',
  scenarioTag: 'scenario_6_delivery_zone',
  outcome: 'ORDER_DEFECT',
  orderState: {
    orderId: 'ord_sc6_001',
    customerIntent: 'PLACE_ORDER',
    orderType: 'DELIVERY',
    deliveryZip: '97035',
    customerPhone: '+15035550381',
    totalEstimatedPrice: 28.5,
    items: [
      {
        itemId: 'item_pizza_large_custom',
        itemName: 'Large Pepperoni Pizza',
        quantity: 1,
        unitPrice: 23.25,
        modifiers: { add: ['Pepperoni'], remove: [] },
      },
    ],
  },
  transcript: [
    { speaker: 'user', text: "Can I get a large pepperoni pizza delivered to 97035?", timestamp: '00:03' },
    { speaker: 'agent', text: "Sure thing! That will be out for delivery in about 45 minutes.", timestamp: '00:06' },
  ],
};

// SCENARIO 7: Duplicate Order / Webhook Retry
export const SCENARIO_7_INCIDENT: Incident = {
  id: 'INC-8528',
  title: 'Webhook ACK timeout triggered un-idempotent retry causing duplicate kitchen tickets',
  severity: 'HIGH',
  restaurantId: 'rest_sidecar_01',
  failureCategory: 'WEBHOOK',
  affectedCallsCount: 5,
  firstDetected: '2026-10-03T21:10:00Z',
  lastDetected: '2026-10-04T01:50:00Z',
  reproductionRatePercent: 100,
  estimatedRevenueExposure: 290.0,
  status: 'INVESTIGATING',
  owner: 'Forward Deployed Engineering',
  scenarioId: 'scenario_7_webhook_retry',
  primaryTraceId: 'tr_sc7_001',
  description:
    'Initial order submission succeeded at POS gateway, but network ACK timed out after 3000ms. Agent webhook worker retried submission using a freshly generated ticket ID instead of an Idempotency-Key. Kitchen printed two identical orders for the same customer call.',
  expectedBehavior:
    'Retries must pass the original Idempotency-Key header (pos_tx_ord_sc7_001). POS adapter must detect existing transaction and return original ticket acknowledgement without re-firing kitchen printer.',
  observedBehavior:
    'POS generated two separate tickets (TKT-9988 and TKT-9989), producing duplicate food waste.',
  rootCauseHypothesis:
    'Retry worker omitted Idempotency-Key header on secondary webhook dispatch.',
  operationalImpact: {
    affectedOrdersCount: 5,
    totalOrdersAnalyzed: 142,
    estimatedDirectRemakeCost: 145.0, // 5 duplicate wasted orders
    estimatedGuestExperienceExposureRevenue: 290.0,
    confidence: 'HIGH',
    evidenceTraceIds: ['tr_sc7_001'],
    costCalculationExplanation: 'Food waste and double billing alerts from customer credit cards.',
  },
  operatorCommunicationDraft:
    'We solved the duplicate kitchen tickets caused by momentary network delays. Every order submission now enforces an idempotency lock so automated retries cannot spawn duplicate orders on your line.',
};

export const SCENARIO_7_TRACE: Trace = {
  traceId: 'tr_sc7_001',
  callId: 'call_sc7_001',
  scenarioId: 'scenario_7_webhook_retry',
  startedAt: '2026-10-03T21:10:00.000Z',
  completedAt: '2026-10-03T21:10:22.000Z',
  totalDurationMs: 22000,
  status: 'ERROR',
  events: [
    {
      id: 'sc7_evt_01',
      traceId: 'tr_sc7_001',
      name: 'ORDER_SUBMITTED',
      timestamp: '2026-10-03T21:10:14.000Z',
      durationMs: 350,
      status: 'SUCCESS',
      input: { orderId: 'ord_sc7_001' },
      output: { ticketCreated: 'TKT-9988' },
      metadata: { component: 'pos_api_client' },
    },
    {
      id: 'sc7_evt_02',
      traceId: 'tr_sc7_001',
      name: 'WEBHOOK_ACK_WAIT',
      timestamp: '2026-10-03T21:10:14.350Z',
      durationMs: 3100,
      status: 'ERROR',
      input: { timeoutMs: 3000 },
      output: { error: 'SOCKET_TIMEOUT_WAITING_ACK' },
      metadata: { component: 'webhook_dispatcher' },
    },
    {
      id: 'sc7_evt_03',
      traceId: 'tr_sc7_001',
      name: 'WEBHOOK_TIMEOUT_RETRY',
      timestamp: '2026-10-03T21:10:17.500Z',
      durationMs: 120,
      status: 'ERROR',
      input: { retryAttempt: 1, idempotencyKeyMissing: true },
      output: { reDispatched: true },
      metadata: {
        component: 'webhook_retry_queue',
        hasDefectHere: true,
        defectExplanation:
          'IDEMPOTENCY MISSING: Retry dispatched without passing deterministic Idempotency-Key header. POS processed order as new.',
      },
    },
    {
      id: 'sc7_evt_04',
      traceId: 'tr_sc7_001',
      name: 'ORDER_SUBMITTED',
      timestamp: '2026-10-03T21:10:17.800Z',
      durationMs: 210,
      status: 'ERROR',
      input: { retryAttempt: 1 },
      output: { duplicateTicketCreated: 'TKT-9989' },
      metadata: { component: 'pos_api_client' },
    },
  ],
};

export const SCENARIO_7_CALL: Call = {
  id: 'call_sc7_001',
  restaurantId: 'rest_sidecar_01',
  customerPhone: '+15035550419',
  startedAt: '2026-10-03T21:10:00.000Z',
  durationSeconds: 22,
  traceId: 'tr_sc7_001',
  scenarioTag: 'scenario_7_webhook_retry',
  outcome: 'ORDER_DEFECT',
  orderState: {
    orderId: 'ord_sc7_001',
    customerIntent: 'PLACE_ORDER',
    orderType: 'PICKUP',
    customerPhone: '+15035550419',
    totalEstimatedPrice: 29.0,
    items: [
      {
        itemId: 'item_pizza_large_custom',
        itemName: 'Large Pepperoni & Bacon Pizza',
        quantity: 1,
        unitPrice: 25.75,
        modifiers: { add: ['Pepperoni', 'Bacon'], remove: [] },
      },
    ],
  },
  transcript: [
    { speaker: 'user', text: "Large pizza with pepperoni and bacon please.", timestamp: '00:03' },
    { speaker: 'agent', text: "Got it! Large pepperoni and bacon pizza for pickup.", timestamp: '00:07' },
  ],
};

export const ALL_INCIDENTS: Incident[] = [
  SCENARIO_2_INCIDENT,
  SCENARIO_3_INCIDENT,
  SCENARIO_4_INCIDENT,
  SCENARIO_5_INCIDENT,
  SCENARIO_6_INCIDENT,
  SCENARIO_7_INCIDENT,
];

export const ALL_CALLS: Call[] = [
  SCENARIO_2_CALL,
  SCENARIO_3_CALL,
  SCENARIO_4_CALL,
  SCENARIO_5_CALL,
  SCENARIO_6_CALL,
  SCENARIO_7_CALL,
];

export const ALL_TRACES: Trace[] = [
  SCENARIO_2_TRACE,
  SCENARIO_3_TRACE,
  SCENARIO_4_TRACE,
  SCENARIO_5_TRACE,
  SCENARIO_6_TRACE,
  SCENARIO_7_TRACE,
];
