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
  DEFAULT_DEFECTIVE_CONFIG,
  PATCHED_CONFIG,
} from '@/lib/posAdapter';
import { runRegressionSuite, SCENARIO_1_EVAL_CASES } from '@/lib/evalEngine';
import { EvalRun } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('scenario-workbench');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-8492');
  const [isPatched, setIsPatched] = useState<boolean>(false);

  // Active incident & trace
  const currentIncident = getIncidentById(selectedIncidentId) || STORE_INCIDENTS[0];
  const currentTrace = getTraceById(currentIncident.primaryTraceId) || STORE_TRACES[0];
  const primaryCall = STORE_CALLS.find((c) => c.scenarioTag === currentIncident.scenarioId) || STORE_CALLS[0];

  // Dynamic execution of Mock POS Adapter (Deterministic TypeScript!)
  const unpatchedAdapter = new MockPOSAdapter(DEFAULT_DEFECTIVE_CONFIG);
  const beforeTransformResult = unpatchedAdapter.transformOrder(primaryCall.orderState);

  const activeAdapter = new MockPOSAdapter(isPatched ? PATCHED_CONFIG : DEFAULT_DEFECTIVE_CONFIG);
  const currentTransformResult = activeAdapter.transformOrder(primaryCall.orderState);

  // Eval Suite state (dynamically executed)
  const [evalRun, setEvalRun] = useState<EvalRun>(() =>
    runRegressionSuite(
      SCENARIO_1_EVAL_CASES,
      DEFAULT_DEFECTIVE_CONFIG
    )
  );

  const handleApplyPatch = () => {
    setIsPatched(true);
    // Execute regression suite with patched config
    const run = runRegressionSuite(SCENARIO_1_EVAL_CASES, PATCHED_CONFIG, 'patch_pos_mod_01');
    setEvalRun(run);
  };

  const handleRevertPatch = () => {
    setIsPatched(false);
    // Execute regression suite with unpatched config
    const run = runRegressionSuite(SCENARIO_1_EVAL_CASES, DEFAULT_DEFECTIVE_CONFIG);
    setEvalRun(run);
  };

  const handleRunReplay = () => {
    // Triggers fresh transformation execution
    const run = runRegressionSuite(
      SCENARIO_1_EVAL_CASES,
      isPatched ? PATCHED_CONFIG : DEFAULT_DEFECTIVE_CONFIG,
      isPatched ? 'patch_pos_mod_01' : undefined
    );
    setEvalRun(run);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-black">
      <HeaderNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: SCENARIO 1 VERTICAL SLICE WORKBENCH */}
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
                  <span className="text-zinc-500 text-[10px] block">Weekly Exposure</span>
                  <span className="text-emerald-400 font-bold">${currentIncident.estimatedRevenueExposure}</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block">Target Scenario</span>
                  <span className="text-zinc-300">The Lost Modifier (No Onions)</span>
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
                  Observe where negative modifiers disappear
                </span>
              </div>
              <OrderStateInspector
                orderState={primaryCall.orderState}
                posPayload={currentTransformResult.payload}
              />
            </section>

            {/* Step 3: Fix Workspace */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Step 3: Fix Workspace & Code Diff
                </span>
                <span className="text-[11px] text-zinc-500">
                  Apply patch to POS serialization logic
                </span>
              </div>
              <FixWorkspace
                incident={currentIncident}
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
                  Ensure fix handles negation idioms without introducing regressions
                </span>
              </div>
              <RegressionEvalSuite
                evalRun={evalRun}
                isPatched={isPatched}
                onRunEval={handleRunReplay}
              />
            </section>

            {/* Step 6: Engineering Handoff & Customer Comms */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Step 6: Engineering Handoff & Operator Translation
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
                setSelectedIncidentId(id);
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
