export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus =
  | 'NEW'
  | 'INVESTIGATING'
  | 'REPRODUCED'
  | 'FIX IN PROGRESS'
  | 'REGRESSION TESTING'
  | 'RESOLVED'
  | 'ESCALATED';

export type FailureClassification =
  | 'PROMPT'
  | 'CONVERSATION STATE'
  | 'MENU KNOWLEDGE'
  | 'CONFIGURATION'
  | 'POS MAPPING'
  | 'TOOL/API'
  | 'WEBHOOK'
  | 'ESCALATION'
  | 'HALLUCINATION'
  | 'SAFETY'
  | 'LATENCY'
  | 'UNKNOWN';

export type EventStatus = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';

export interface ModifierItem {
  id: string;
  name: string;
  priceDelta: number;
  isDefault?: boolean;
}

export interface ModifierGroup {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  options: ModifierItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'pizza' | 'burger' | 'salad' | 'sandwich' | 'beverage' | 'special';
  basePrice: number;
  available: boolean;
  availabilityWindow?: {
    startHour: number; // 0-23
    endHour: number;   // 0-23
  };
  modifierGroupIds: string[];
  allergens: string[];
  description: string;
}

export interface Restaurant {
  id: string;
  name: string;
  concept: string;
  posType: 'MOCK_POS_V2';
  deliveryZones: {
    zipCodes: string[];
    maxRadiusMiles: number;
  };
  hours: {
    openHour: number;
    closeHour: number;
  };
  allergensPolicy: {
    strictEscalation: boolean;
    disclaimer: string;
  };
}

export interface TranscriptTurn {
  speaker: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  latencyMs?: number;
}

export interface ConversationalModifierState {
  add: string[];
  remove: string[];
  specialInstructions?: string[];
  // For half-and-half pizza configuration:
  halfOneAdd?: string[];
  halfTwoAdd?: string[];
}

export interface AgentOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  modifiers: ConversationalModifierState;
  unitPrice: number;
  notes?: string;
}

export interface AgentOrderState {
  orderId: string;
  customerIntent: 'PLACE_ORDER' | 'MODIFY_ORDER' | 'CHECK_STATUS' | 'MENU_INQUIRY' | 'ESCALATE';
  orderType: 'PICKUP' | 'DELIVERY';
  deliveryZip?: string;
  items: AgentOrderItem[];
  rawDiscounts?: string[];
  customerPhone: string;
  totalEstimatedPrice: number;
  specialPrepInstructions?: string;
}

export interface POSItemModifierPayload {
  modifierId: string;
  name: string;
  action: 'ADD' | 'REMOVE';
  priceDelta: number;
  targetFraction?: 'WHOLE' | 'FIRST_HALF' | 'SECOND_HALF';
}

export interface POSOrderItemPayload {
  posItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  modifiers: POSItemModifierPayload[];
  subtotal: number;
  specialInstructions?: string;
}

export interface POSOrderPayload {
  idempotencyKey: string;
  externalOrderId: string;
  restaurantId: string;
  channel: 'VOICE_AGENT';
  orderType: 'PICKUP' | 'DELIVERY';
  deliveryDetails?: {
    zipCode: string;
    validated: boolean;
  };
  lineItems: POSOrderItemPayload[];
  taxAmount: number;
  totalAmount: number;
  submittedAt: string;
  metadata?: Record<string, unknown>;
}

export interface TraceEvent {
  id: string;
  traceId: string;
  parentId?: string;
  name:
    | 'CALL_STARTED'
    | 'USER_UTTERANCE'
    | 'INTENT_CLASSIFIED'
    | 'MENU_LOOKUP'
    | 'ITEM_SELECTED'
    | 'MODIFIER_PARSED'
    | 'ORDER_STATE_UPDATED'
    | 'AGENT_RESPONSE'
    | 'ORDER_CONFIRMED'
    | 'POS_TRANSFORM_STARTED'
    | 'POS_MODIFIER_MAPPED'
    | 'POS_PAYLOAD_CREATED'
    | 'ORDER_SUBMITTED'
    | 'WEBHOOK_ACK_WAIT'
    | 'WEBHOOK_TIMEOUT_RETRY'
    | 'CALL_COMPLETED'
    | 'POLICY_VIOLATION_CHECK';
  timestamp: string;
  durationMs: number;
  status: EventStatus;
  input: unknown;
  output: unknown;
  metadata: {
    component: string;
    hasDefectHere?: boolean;
    defectExplanation?: string;
    [key: string]: unknown;
  };
}

export interface Trace {
  traceId: string;
  callId: string;
  scenarioId: string;
  events: TraceEvent[];
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
  status: EventStatus;
}

export interface Call {
  id: string;
  restaurantId: string;
  customerPhone: string;
  startedAt: string;
  durationSeconds: number;
  transcript: TranscriptTurn[];
  traceId: string;
  orderState: AgentOrderState;
  finalPosPayload?: POSOrderPayload;
  outcome: 'SUCCESS' | 'ORDER_DEFECT' | 'ESCALATED' | 'DROPPED';
  scenarioTag: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  restaurantId: string;
  failureCategory: FailureClassification;
  affectedCallsCount: number;
  firstDetected: string;
  lastDetected: string;
  reproductionRatePercent: number;
  estimatedRevenueExposure: number;
  status: IncidentStatus;
  owner: string;
  scenarioId: string;
  primaryTraceId: string;
  description: string;
  expectedBehavior: string;
  observedBehavior: string;
  rootCauseHypothesis: string;
  operationalImpact: OperationalImpact;
  operatorCommunicationDraft: string;
}

export interface OperationalImpact {
  affectedOrdersCount: number;
  totalOrdersAnalyzed: number;
  estimatedDirectRemakeCost: number;
  estimatedGuestExperienceExposureRevenue: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceTraceIds: string[];
  costCalculationExplanation: string;
}

export interface Patch {
  id: string;
  incidentId: string;
  title: string;
  reasonForChange: string;
  affectedComponent: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  expectedBehavior: string;
  author: string;
  timestamp: string;
  codeDiff: string;
  version: string;
}

export interface EvalCase {
  id: string;
  scenarioId: string;
  inputPrompt: string;
  expectedNormalizedState: {
    item: string;
    quantity: number;
    addModifiers: string[];
    removeModifiers: string[];
    halfOneAdd?: string[];
    halfTwoAdd?: string[];
  };
  expectedPosPayloadCheck: {
    hasAddModifiers: string[];
    hasRemoveModifiers: string[];
    expectedTotalItemsCount: number;
    halfAndHalfPreserved?: boolean;
    rejectedOutOfHours?: boolean;
    escalatedForAllergy?: boolean;
    duplicatePrevented?: boolean;
  };
}

export interface EvalResultCase {
  caseId: string;
  inputPrompt: string;
  passed: boolean;
  observedNormalizedState: unknown;
  observedPosPayload: unknown;
  failureReason?: string;
  diffExplanation?: string;
}

export interface EvalRun {
  scenarioId: string;
  patchApplied: boolean;
  patchId?: string;
  totalCases: number;
  passedCases: number;
  passRatePercent: number;
  results: EvalResultCase[];
  executedAt: string;
}

export interface AccountHealthMetrics {
  totalCalls: number;
  containmentRatePercent: number;
  completedOrders: number;
  orderConversionPercent: number;
  staffEscalations: number;
  failedOrders: number;
  agentQualityScore: number; // 0 - 100
  averageLatencyMs: number;
  estimatedRevenueInfluenced: number;
  estimatedRevenueAtRisk: number;
  modeledFinancialDisclaimer: string;
}
