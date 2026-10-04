'use client';

import React, { useState } from 'react';
import { HeaderNav } from '@/components/HeaderNav';
import { TraceViewer } from '@/components/TraceViewer';
import { OrderStateInspector } from '@/components/OrderStateInspector';
import { FixWorkspace } from '@/components/FixWorkspace';
import { ReplayComparison } from '@/components/ReplayComparison';
import { RegressionEvalSuite } from '@/components/RegressionEvalSuite';
import { EngineeringHandoff } from '@/components/EngineeringHandoff';
import { IncidentQueue } from '@/components/IncidentQueue';
import { AccountHealth } from '@/components/AccountHealth';
import { CallExplorer } from '@/components/CallExplorer';
import { AboutPortfolio } from '@/components/AboutPortfolio';

import {
  STORE_INCIDENTS,
  STORE_CALLS,
  STORE_TRACES,
  getIncidentById,
  getTraceById,
} from '@/data/repository';
import { SIDECAR_ACCOUNT_HEALTH } from '@/data/scenario1Fixtures';
import {
  MockPOSAdapter,
  PATCHED_CONFIG,
  TransformationConfig,
} from '@/lib/posAdapter';
import { runRegressionSuite, SCENARIO_1_EVAL_CASES } from '@/lib/evalEngine';
import { WORKBENCH_SCENARIO_CONFIGS } from '@/data/scenarioWorkbenchConfig';
import { EvalRun } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('scenario-workbench');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-8492');
  const [isPatched, setIsPatched] = useState<boolean>(false);

  // Active incident & trace
  const currentIncident = getIncidentById(selectedIncidentId) || STORE_INCIDENTS[0];
  const currentTrace = getTraceById(currentIncident.primaryTraceId) || STORE_TRACES[0];
  const primaryCall = STORE_CALLS.find((c) => c.scenarioTag === currentIncident.scenarioId) || STORE_CALLS[0];

  // Dynamic workbench configuration for the selected scenario
  const scenarioConfig =
    WORKBENCH_SCENARIO_CONFIGS[currentIncident.scenarioId] ||
    WORKBENCH_SCENARIO_CONFIGS['scenario_1_lost_modifier'];

  // Eval cases for this scenario (Scenario 1 uses SCENARIO_1_EVAL_CASES, others use their configured cases)
  const currentEvalCases =
    currentIncident.scenarioId === 'scenario_1_lost_modifier'
      ? SCENARIO_1_EVAL_CASES
      : scenarioConfig.evalCases.length > 0
      ? scenarioConfig.evalCases
      : SCENARIO_1_EVAL_CASES;

  // Active runtime configs based on scenario
  const getScenarioConfigs = (patched: boolean): TransformationConfig => {
    if (patched) {
      return PATCHED_CONFIG;
    }
    // Isolate defects per scenario
    return {
      preserveNegativeModifiers: currentIncident.scenarioId !== 'scenario_1_lost_modifier',
      supportHalfAndHalfSplits: currentIncident.scenarioId !== 'scenario_2_half_and_half',
      enforceAvailabilityHours: currentIncident.scenarioId !== 'scenario_3_temporal_menu',
      enableIdempotencyGuard: currentIncident.scenarioId !== 'scenario_7_webhook_retry',
    };
  };

  // Dynamic execution of Mock POS Adapter (Deterministic TypeScript!)
  const unpatchedAdapter = new MockPOSAdapter(getScenarioConfigs(false));
  const beforeTransformResult = unpatchedAdapter.transformOrder(
    primaryCall.orderState,
    currentIncident.firstDetected
  );

  const activeAdapter = new MockPOSAdapter(getScenarioConfigs(isPatched));
  const currentTransformResult = activeAdapter.transformOrder(
    primaryCall.orderState,
    currentIncident.firstDetected
  );

  // Eval Suite state (dynamically executed)
  const [evalRun, setEvalRun] = useState<EvalRun>(() =>
    runRegressionSuite(currentEvalCases, getScenarioConfigs(false))
  );

  const handleApplyPatch = () => {
    setIsPatched(true);
    const run = runRegressionSuite(
      currentEvalCases,
      getScenarioConfigs(true),
      scenarioConfig.patch.id
    );
    setEvalRun(run);
  };

  const handleRevertPatch = () => {
    setIsPatched(false);
    const run = runRegressionSuite(currentEvalCases, getScenarioConfigs(false));
    setEvalRun(run);
  };

  const handleRunReplay = () => {
    const run = runRegressionSuite(
      currentEvalCases,
      getScenarioConfigs(isPatched),
      isPatched ? scenarioConfig.patch.id : undefined
    );
    setEvalRun(run);
  };

  // When changing selected incident, update eval run
  const handleSelectIncidentFromQueue = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setIsPatched(false);
    const inc = getIncidentById(incidentId) || STORE_INCIDENTS[0];
    const sCfg =
      WORKBENCH_SCENARIO_CONFIGS[inc.scenarioId] ||
      WORKBENCH_SCENARIO_CONFIGS['scenario_1_lost_modifier'];
    const cases =
      inc.scenarioId === 'scenario_1_lost_modifier'
        ? SCENARIO_1_EVAL_CASES
        : sCfg.evalCases.length > 0
        ? sCfg.evalCases
        : SCENARIO_1_EVAL_CASES;
    setEvalRun(
      runRegressionSuite(cases, {
        preserveNegativeModifiers: inc.scenarioId !== 'scenario_1_lost_modifier',
        supportHalfAndHalfSplits: inc.scenarioId !== 'scenario_2_half_and_half',
        enforceAvailabilityHours: inc.scenarioId !== 'scenario_3_temporal_menu',
        enableIdempotencyGuard: inc.scenarioId !== 'scenario_7_webhook_retry',
      })
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-black">
      <HeaderNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: SCENARIO WORKBENCH */}
        {activeTab === 'scenario-workbench' && (
          <div className="space-y-6">
            {/* Context Header */}
            <div className="bg-zinc-900/90 rounded-lg border border-zinc-800 p-4 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                      {currentIncident.id}
                    </span>
                    <h1 className="text-base font-bold text-zinc-100">
                      {currentIncident.title}
                    </h1>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
                    {currentIncident.description}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right text-xs font-mono">
                    <span className="text-zinc-500 block text-[10px]">Failure Classification</span>
                    <span className="text-cyan-300 font-bold">{currentIncident.failureCategory}</span>
                  </div>
                </div>
              </div>

              {/* Status bar */}
              <div className="mt-4 pt-3 border-t border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                <div>
                  <span className="text-zinc-500 text-[10px] block">Customer</span>
                  <span className="text-zinc-200">Sidecar Pizza Co.</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block">Reproduction Rate</span>
                  <span className="text-rose-400 font-bold">100% (Deterministic)</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block">Weekly Modeled Exposure</span>
                  <span className="text-emerald-400 font-bold">${currentIncident.estimatedRevenueExposure}</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block">Active Scenario Target</span>
                  <span className="text-zinc-300 truncate block">{scenarioConfig.scenarioTitle}</span>
                </div>
              </div>
            </div>

            {/* Step 1: Trace Viewer */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Step 1: Inspect Execution Trace
                </span>
                <span className="text-[11px] text-zinc-500">
                  Trace ID: {currentTrace.traceId}
                </span>
              </div>
              <TraceViewer trace={currentTrace} />
            </section>

            {/* Step 2: Order State Inspector */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Step 2: Inspect Multi-Layer Order State
                </span>
                <span className="text-[11px] text-zinc-500">
                  Compare Conversational State vs POS Payload
                </span>
              </div>
              <OrderStateInspector
                orderState={primaryCall.orderState}
                posPayload={currentTransformResult.payload}
                scenarioSubtitle={scenarioConfig.inspectorSubtitle}
              />
            </section>

            {/* Step 3: Fix Workspace */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Step 3: Fix Workspace &amp; Runtime Patch
                </span>
                <span className="text-[11px] text-zinc-500">
                  Target Component: {scenarioConfig.diffComponent}
                </span>
              </div>
              <FixWorkspace
                incident={currentIncident}
                patchData={scenarioConfig.patch}
                codeDiffHunk={scenarioConfig.diffHunk}
                isPatched={isPatched}
                onApplyPatch={handleApplyPatch}
                onRevertPatch={handleRevertPatch}
                onRunReplay={handleRunReplay}
              />
            </section>

            {/* Step 4: Replay Engine */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Step 4: Replay Synthetic Call
                </span>
                <span className="text-[11px] text-zinc-500">
                  Compare Kitchen Ticket Before vs After Patch
                </span>
              </div>
              <ReplayComparison
                beforePayload={beforeTransformResult.payload}
                afterPayload={currentTransformResult.payload}
                isPatched={isPatched}
                scenarioTag={currentIncident.scenarioId}
                onReplayClick={handleRunReplay}
              />
            </section>

            {/* Step 5: Regression Eval Suite */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Step 5: Run Deterministic Regression Suite
                </span>
                <span className="text-[11px] text-zinc-500">
                  Executes live NLU parsing + Mock POS translation on each test case
                </span>
              </div>
              <RegressionEvalSuite
                evalRun={evalRun}
                isPatched={isPatched}
                scenarioTitle={scenarioConfig.scenarioTitle}
                onRunEval={handleRunReplay}
              />
            </section>

            {/* Step 6: Engineering Handoff & Customer Comms */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Step 6: Engineering Handoff &amp; Operator Translation
                </span>
                <span className="text-[11px] text-zinc-500">
                  Linear / Jira Ticket + Plain English Operator Summary
                </span>
              </div>
              <EngineeringHandoff incident={currentIncident} isPatched={isPatched} />
            </section>
          </div>
        )}

        {/* VIEW 2: INCIDENTS QUEUE */}
        {activeTab === 'incident-queue' && (
          <div className="space-y-6">
            <IncidentQueue
              incidents={STORE_INCIDENTS}
              selectedIncidentId={selectedIncidentId}
              onSelectIncident={(id) => {
                handleSelectIncidentFromQueue(id);
                setActiveTab('scenario-workbench');
              }}
            />
          </div>
        )}

        {/* VIEW 3: CALL EXPLORER */}
        {activeTab === 'call-explorer' && (
          <CallExplorer calls={STORE_CALLS} traces={STORE_TRACES} />
        )}

        {/* VIEW 4: ACCOUNT HEALTH */}
        {activeTab === 'account-health' && (
          <AccountHealth metrics={SIDECAR_ACCOUNT_HEALTH} />
        )}

        {/* VIEW 5: ABOUT PORTFOLIO */}
        {activeTab === 'about-portfolio' && <AboutPortfolio />}
      </main>
    </div>
  );
}
