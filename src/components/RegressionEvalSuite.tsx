import React from 'react';
import { EvalRun } from '@/types';
import { Play, CheckCircle2, XCircle, ShieldCheck, AlertTriangle } from 'lucide-react';

interface RegressionEvalSuiteProps {
  evalRun: EvalRun;
  isPatched: boolean;
  scenarioTitle?: string;
  onRunEval: () => void;
}

export function RegressionEvalSuite({
  evalRun,
  isPatched,
  scenarioTitle,
  onRunEval,
}: RegressionEvalSuiteProps) {
  return (
    <div className="bg-zinc-900/90 rounded-lg border border-zinc-800 overflow-hidden shadow-xl">
      <div className="px-4 py-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-zinc-200">
            Deterministic Regression Suite: {scenarioTitle || 'Scenario Boundary Matrix'}
          </span>
          <span className="text-xs text-zinc-500">·</span>
          <span className="text-xs font-mono text-zinc-400">
            {evalRun.passedCases}/{evalRun.totalCases} Passing ({evalRun.passRatePercent}%)
          </span>
        </div>

        <button
          onClick={onRunEval}
          className="flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-zinc-950 rounded shadow transition"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>RUN REGRESSION</span>
        </button>
      </div>

      {/* Score Banner */}
      <div className="p-4 border-b border-zinc-850 bg-zinc-950/40 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">Suite Coverage</span>
          <span className="text-lg font-bold text-zinc-100">
            {evalRun.totalCases} Variations Evaluated
          </span>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Real utterance interpretation + structured boundary assertions
          </p>
        </div>

        <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">
            Current Status ({isPatched ? 'AFTER PATCH' : 'BEFORE PATCH'})
          </span>
          <div className="flex items-center space-x-2 mt-0.5">
            <span
              className={`text-2xl font-black font-mono ${
                evalRun.passRatePercent >= 100
                  ? 'text-emerald-400'
                  : evalRun.passRatePercent >= 60
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {evalRun.passRatePercent}%
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              ({evalRun.passedCases}/{evalRun.totalCases} cases)
            </span>
          </div>
        </div>

        <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800">
          <span className="text-[10px] font-mono uppercase text-zinc-500 block">
            Deterministic Engine
          </span>
          <p className="text-[11px] text-zinc-300 leading-tight mt-1">
            Every test case executes live TypeScript NLU parsing and Mock POS translation. No hardcoded mock assertions.
          </p>
        </div>
      </div>

      {/* Table of Cases */}
      <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 sticky top-0">
            <tr>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Test Case Input Utterance</th>
              <th className="px-3 py-2">Observed POS Payload</th>
              <th className="px-3 py-2">Failure Reason / Assertions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850">
            {evalRun.results.map((res) => (
              <tr
                key={res.caseId}
                className={`hover:bg-zinc-800/40 transition ${
                  res.passed ? 'bg-zinc-900/20' : 'bg-rose-950/10'
                }`}
              >
                <td className="px-3 py-2.5 whitespace-nowrap">
                  {res.passed ? (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>PASS</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                      <XCircle className="w-3 h-3" />
                      <span>FAIL</span>
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 font-sans font-medium text-zinc-200">
                  &quot;{res.inputPrompt}&quot;
                </td>
                <td className="px-3 py-2.5 text-zinc-400">
                  {res.observedPosPayload &&
                  typeof res.observedPosPayload === 'object' &&
                  'posModifiers' in res.observedPosPayload ? (
                    <span className="text-zinc-300">
                      [
                      {(res.observedPosPayload as { posModifiers: string[] }).posModifiers.join(', ')}
                      ]
                    </span>
                  ) : (
                    <span className="text-zinc-600 italic">None</span>
                  )}
                </td>
                <td className="px-3 py-2.5 font-sans">
                  {res.passed ? (
                    <span className="text-emerald-400 text-xs">All modifier assertions verified</span>
                  ) : (
                    <span className="text-rose-300 text-xs flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400 flex-shrink-0" />
                      <span>{res.failureReason}</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
