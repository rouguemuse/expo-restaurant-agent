import React from 'react';
import { Incident, Patch } from '@/types';
import {
  Code2,
  GitCommit,
  Play,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

interface FixWorkspaceProps {
  incident: Incident;
  isPatched: boolean;
  onApplyPatch: () => void;
  onRevertPatch: () => void;
  onRunReplay: () => void;
}

export function FixWorkspace({
  incident,
  isPatched,
  onApplyPatch,
  onRevertPatch,
  onRunReplay,
}: FixWorkspaceProps) {
  const patchData: Patch = {
    id: 'patch_pos_mod_01',
    incidentId: incident.id,
    title: 'POSAdapter: iterate negative modifier state and emit REMOVE action',
    reasonForChange:
      'Conversational state captures negative modifiers in `item.modifiers.remove`, but MockPOSAdapter legacy loop only transformed `add` modifiers, dropping exclusions before kitchen ticket creation.',
    affectedComponent: 'src/lib/posAdapter.ts',
    riskLevel: 'LOW',
    expectedBehavior:
      'All elements in `item.modifiers.remove` must serialize as `{ action: "REMOVE", name: mod.name, priceDelta: 0 }` within the POSOrderPayload line item.',
    author: 'fde-oncall@sidecar-pizza.internal',
    timestamp: '2026-10-04T07:20:00Z',
    version: '2.1.0-patch1',
    codeDiff: `--- a/src/lib/posAdapter.ts
+++ b/src/lib/posAdapter.ts
@@ -82,6 +82,16 @@ export class MockPOSAdapter {
       itemModifierCost += modMeta.priceDelta;
     }

+    // 2. Process REMOVE modifiers (Patch fix for INC-8492)
+    for (const remMod of item.modifiers.remove || []) {
+      const modMeta = this.resolveModifierMeta(remMod);
+      posModifiers.push({
+        modifierId: modMeta.id,
+        name: modMeta.name,
+        action: 'REMOVE',
+        priceDelta: 0.0,
+        targetFraction: 'WHOLE',
+      });
     }
 
     const itemTotal = (item.unitPrice + itemModifierCost) * item.quantity;`,
  };

  return (
    <div className="bg-zinc-900/90 rounded-lg border border-zinc-800 overflow-hidden shadow-xl">
      <div className="px-4 py-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-zinc-200">
            Fix Workspace: Configuration & Adapter Patch
          </span>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              isPatched
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            {isPatched ? 'PATCH APPLIED (LIVE)' : 'UNPATCHED (PRODUCTION REPRO)'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {isPatched ? (
            <button
              onClick={onRevertPatch}
              className="flex items-center space-x-1.5 px-2.5 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Revert Patch</span>
            </button>
          ) : (
            <button
              onClick={onApplyPatch}
              className="flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded shadow transition"
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Apply Fix Patch</span>
            </button>
          )}

          <button
            onClick={onRunReplay}
            className="flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-zinc-950 rounded shadow transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Replay</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Patch metadata bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded bg-zinc-950 border border-zinc-850">
            <span className="text-[10px] font-mono text-zinc-500 block">Affected Component</span>
            <span className="font-mono text-zinc-300 font-semibold">{patchData.affectedComponent}</span>
          </div>
          <div className="p-2 rounded bg-zinc-950 border border-zinc-850">
            <span className="text-[10px] font-mono text-zinc-500 block">Risk Level</span>
            <span className="font-semibold text-emerald-400 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span>{patchData.riskLevel} (Scoped Adapter)</span>
            </span>
          </div>
          <div className="p-2 rounded bg-zinc-950 border border-zinc-850">
            <span className="text-[10px] font-mono text-zinc-500 block">Linked Incident</span>
            <span className="font-mono text-amber-400 font-semibold">{incident.id}</span>
          </div>
          <div className="p-2 rounded bg-zinc-950 border border-zinc-850">
            <span className="text-[10px] font-mono text-zinc-500 block">Patch Version</span>
            <span className="font-mono text-zinc-300">{patchData.version}</span>
          </div>
        </div>

        {/* Diff view */}
        <div className="border border-zinc-800 rounded bg-zinc-950 overflow-hidden font-mono text-xs">
          <div className="px-3 py-1.5 bg-zinc-900/80 border-b border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Unified Diff: MockPOSAdapter.transformOrder()</span>
            <span className="text-zinc-500">TypeScript · Line 82</span>
          </div>
          <pre className="p-3 text-[11px] leading-relaxed overflow-x-auto text-zinc-300">
            {patchData.codeDiff.split('\n').map((line, idx) => {
              const isAdd = line.startsWith('+');
              const isDel = line.startsWith('-');
              const isHunk = line.startsWith('@@');

              let lineClass = 'text-zinc-400';
              if (isAdd) lineClass = 'bg-emerald-950/40 text-emerald-300 font-medium';
              if (isDel) lineClass = 'bg-rose-950/40 text-rose-300';
              if (isHunk) lineClass = 'text-cyan-400 bg-zinc-900/60';

              return (
                <div key={idx} className={`px-2 py-0.5 rounded-sm ${lineClass}`}>
                  {line}
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    </div>
  );
}
