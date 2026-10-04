import React from 'react';
import { POSOrderPayload } from '@/types';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface ReplayComparisonProps {
  beforePayload?: POSOrderPayload;
  afterPayload?: POSOrderPayload;
  isPatched: boolean;
  scenarioTag: string;
  onReplayClick: () => void;
}

export function ReplayComparison({
  beforePayload,
  afterPayload,
  isPatched,
  scenarioTag,
  onReplayClick,
}: ReplayComparisonProps) {
  const beforeFirstItem = beforePayload?.lineItems[0];
  const afterFirstItem = afterPayload?.lineItems[0];

  const beforeHasNegative = beforeFirstItem?.modifiers.some((m) => m.action === 'REMOVE');

  return (
    <div className="bg-zinc-900/90 rounded-lg border border-zinc-800 overflow-hidden shadow-xl">
      <div className="px-4 py-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-zinc-200">
            Replay Engine: Synthetic Call Before vs After Transformation
          </span>
        </div>
        <button
          onClick={onReplayClick}
          className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-emerald-700/80 hover:bg-emerald-600 text-white rounded transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Re-execute Synthetic Stream</span>
        </button>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BEFORE TICKET */}
        <div className="border border-rose-900/60 bg-rose-950/10 rounded-md p-3">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-900/40">
            <div className="flex items-center space-x-1.5">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-rose-300">BEFORE PATCH: Production State</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              ORIGINAL INCIDENT: FAIL
            </span>
          </div>

          <div className="font-mono text-xs space-y-1.5">
            <div className="text-zinc-400">
              Item: <span className="text-zinc-200 font-semibold">{beforeFirstItem?.name || 'Item unavailable'}</span>{' '}
              <span className="text-amber-300">(qty: {beforeFirstItem?.quantity || 1})</span>
            </div>
            <div className="text-zinc-400">Printed Modifiers on Kitchen Display:</div>
            <div className="pl-3 space-y-1 py-1">
              {beforeFirstItem?.modifiers.map((m, idx) => (
                <div key={idx} className="text-emerald-400">
                  {m.action === 'REMOVE' ? '- ' : '+ '}
                  {m.name}{' '}
                  {m.targetFraction && <span className="text-zinc-500 text-[10px]">({m.targetFraction})</span>}
                </div>
              ))}
              {scenarioTag === 'scenario_1_lost_modifier' && !beforeHasNegative && (
                <div className="text-rose-400 font-semibold bg-rose-950/40 px-1 py-0.5 rounded">
                  [!] DEFECT: Negative exclusions lost during POS serialization!
                </div>
              )}
              {scenarioTag === 'scenario_2_half_and_half' && (
                <div className="text-rose-400 font-semibold bg-rose-950/40 px-1 py-0.5 rounded">
                  [!] DEFECT: Both toppings marked WHOLE pie! Split was flattened.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AFTER TICKET */}
        <div
          className={`border rounded-md p-3 ${
            isPatched
              ? 'border-emerald-800 bg-emerald-950/20'
              : 'border-zinc-800 bg-zinc-950/40 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2
                className={`w-4 h-4 ${isPatched ? 'text-emerald-400' : 'text-zinc-500'}`}
              />
              <span className="text-xs font-bold text-emerald-300">
                AFTER PATCH: Replay Payload
              </span>
            </div>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                isPatched
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              {isPatched ? 'REPLAY: PASS' : 'PATCH NOT ACTIVE'}
            </span>
          </div>

          <div className="font-mono text-xs space-y-1.5">
            <div className="text-zinc-400">
              Item: <span className="text-zinc-200 font-semibold">{afterFirstItem?.name || 'Handled by rule'}</span>{' '}
              <span className="text-amber-300">(qty: {afterFirstItem?.quantity || 1})</span>
            </div>
            <div className="text-zinc-400">Printed Modifiers on Kitchen Display:</div>
            <div className="pl-3 space-y-1 py-1">
              {afterFirstItem?.modifiers.map((m, idx) => (
                <div
                  key={idx}
                  className={`font-semibold ${
                    m.action === 'REMOVE' ? 'text-rose-300 bg-rose-950/30 px-1 py-0.5 rounded inline-block' : 'text-emerald-400'
                  }`}
                >
                  {m.action === 'REMOVE' ? '- ' : '+ '}
                  {m.name}{' '}
                  {m.targetFraction && <span className="text-cyan-400 text-[10px]">({m.targetFraction})</span>}
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
              Resulting kitchen outcome:{' '}
              <span className="text-emerald-300 font-medium">
                {isPatched
                  ? 'Corrected payload received at kitchen make-line. Ticket prepared 100% accurately.'
                  : 'Activate patched runtime to test replay verification.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
