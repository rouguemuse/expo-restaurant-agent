import React, { useState } from 'react';
import { Incident } from '@/types';
import {
  FileText,
  Copy,
  Check,
  MessageSquare,
  DollarSign,
} from 'lucide-react';

interface EngineeringHandoffProps {
  incident: Incident;
  isPatched: boolean;
}

export function EngineeringHandoff({ incident, isPatched }: EngineeringHandoffProps) {
  const [copiedJira, setCopiedJira] = useState(false);
  const [copiedOperator, setCopiedOperator] = useState(false);

  const jiraTicketContent = `TITLE: [${incident.id}] ${incident.title}
SEVERITY: ${incident.severity}
CUSTOMER: Sidecar Pizza Co. (rest_sidecar_01)
ENVIRONMENT: Live Voice AI Telephony Cluster / Mock POS v2.1
TRACE IDS: ${incident.operationalImpact.evidenceTraceIds.join(', ')}

EXPECTED BEHAVIOR:
${incident.expectedBehavior}

OBSERVED BEHAVIOR:
${incident.observedBehavior}

REPRODUCTION STEPS:
1. Initiate inbound SIP phone call to Sidecar Pizza agent.
2. Order item with negative modifier: "Double cheeseburger, no onions, extra pickles."
3. Observe agent speech: verbal confirmation correctly captures exclusion.
4. Inspect POS transformer payload: lineItems[0].modifiers lacks { action: "REMOVE", name: "Onions" }.
5. Kitchen ticket prints standard burger without removing onions.

REPRODUCTION RATE: ${incident.reproductionRatePercent}% (Deterministic boundary loss)
AFFECTED CALLS: ${incident.affectedCallsCount} calls detected

ROOT CAUSE HYPOTHESIS:
${incident.rootCauseHypothesis}

FAILURE LAYER: ${incident.failureCategory}
CURRENT WORKAROUND: Kitchen manually monitors special prep notes until patch deployment.
PROPOSED FIX: Iterate over conversational order state \`modifiers.remove\` and serialize typed POS REMOVE modifiers.
STATUS: ${isPatched ? 'RESOLVED / VALIDATED' : incident.status}`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900/90 rounded-lg border border-zinc-800 overflow-hidden shadow-xl space-y-4 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-zinc-200">
            Forward Deployed Engineering: Handoff & Customer Comms
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">
          Bridging Engineering & Operator Operations
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Engineering Ticket */}
        <div className="border border-zinc-800 rounded bg-zinc-950 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-850">
              <span className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Internal Engineering Ticket (Jira/Linear Format)</span>
              </span>
              <button
                onClick={() => copyToClipboard(jiraTicketContent, setCopiedJira)}
                className="flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              >
                {copiedJira ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-zinc-400" />
                    <span>Copy Ticket</span>
                  </>
                )}
              </button>
            </div>
            <pre className="font-mono text-[11px] text-zinc-400 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto p-2 bg-zinc-900/50 rounded border border-zinc-850">
              {jiraTicketContent}
            </pre>
          </div>
        </div>

        {/* Operator Communication */}
        <div className="border border-zinc-800 rounded bg-zinc-950 p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-850">
              <span className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Operator-Facing Communication Draft</span>
              </span>
              <button
                onClick={() =>
                  copyToClipboard(incident.operatorCommunicationDraft, setCopiedOperator)
                }
                className="flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
              >
                {copiedOperator ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-zinc-400" />
                    <span>Copy Draft</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded bg-zinc-900/50 border border-zinc-850 text-xs text-zinc-300 leading-relaxed font-sans">
              <div className="text-[10px] uppercase font-mono text-amber-400/90 mb-2 font-semibold">
                Client: Sidecar Pizza General Manager & Head of Kitchen Operations
              </div>
              <p>{incident.operatorCommunicationDraft}</p>
            </div>

            {/* Evidence & Financial Translation */}
            <div className="mt-3 p-3 rounded bg-zinc-900/40 border border-zinc-800 text-xs space-y-2">
              <span className="text-[11px] font-bold text-zinc-200 flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Signal-Style Operational Impact Translation</span>
              </span>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                <div className="p-1.5 rounded bg-zinc-950 border border-zinc-850">
                  <span className="text-zinc-500 block text-[10px]">Affected Orders:</span>
                  <span className="text-zinc-200 font-bold">
                    {incident.operationalImpact.affectedOrdersCount} /{' '}
                    {incident.operationalImpact.totalOrdersAnalyzed} analyzed
                  </span>
                </div>
                <div className="p-1.5 rounded bg-zinc-950 border border-zinc-850">
                  <span className="text-zinc-500 block text-[10px]">Direct Waste Cost:</span>
                  <span className="text-rose-300 font-bold">
                    ${incident.operationalImpact.estimatedDirectRemakeCost.toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans pt-1">
                {incident.operationalImpact.costCalculationExplanation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
