import { Incident, Call, Trace } from '@/types';
import {
  SCENARIO_1_INCIDENT,
  SCENARIO_1_CALL,
  SCENARIO_1_PRIMARY_TRACE,
} from './scenario1Fixtures';
import { ALL_INCIDENTS, ALL_CALLS, ALL_TRACES } from './additionalScenarios';

export const STORE_INCIDENTS: Incident[] = [SCENARIO_1_INCIDENT, ...ALL_INCIDENTS];

export const STORE_CALLS: Call[] = [SCENARIO_1_CALL, ...ALL_CALLS];

export const STORE_TRACES: Trace[] = [SCENARIO_1_PRIMARY_TRACE, ...ALL_TRACES];

export function getIncidentById(id: string): Incident | undefined {
  return STORE_INCIDENTS.find((i) => i.id === id);
}

export function getCallById(id: string): Call | undefined {
  return STORE_CALLS.find((c) => c.id === id);
}

export function getTraceById(traceId: string): Trace | undefined {
  return STORE_TRACES.find((t) => t.traceId === traceId);
}
