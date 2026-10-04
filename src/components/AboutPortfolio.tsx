import React from 'react';
import { Cpu, ShieldAlert } from 'lucide-react';

export function AboutPortfolio() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-zinc-900/90 rounded-lg border border-zinc-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3 pb-4 border-b border-zinc-800">
          <div className="w-10 h-10 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-100">About EXPO</h1>
            <p className="text-xs text-zinc-400">
              Restaurant Voice Agent Reliability Lab · Portfolio Architecture Simulation
            </p>
          </div>
        </div>

        <div className="prose prose-invert text-xs space-y-4 text-zinc-300 leading-relaxed font-sans">
          <p>
            <strong>EXPO</strong> is a portfolio simulation exploring the reliability engineering
            required to operate restaurant Voice AI systems after deployment.
          </p>
          <p>
            It models the real technical boundaries between conversational AI, restaurant
            configuration, POS transformation, production observability, incident response, and
            deterministic regression evaluation.
          </p>

          <div className="p-4 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 space-y-2">
            <div className="flex items-center space-x-2 text-zinc-200 font-semibold">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Synthetic Data & Platform Disclaimer</span>
            </div>
            <p>
              All restaurants, calls, transactions, integrations, and financial figures are
              synthetic.
            </p>
            <p>
              No affiliation with or integration into Toast, Retell, Langfuse, Loman AI, or other
              third-party platforms is implied.
            </p>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-bold text-zinc-100 mb-2">Key Engineering Capabilities Demonstrated</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>
                <strong>Deterministic POS Transformation:</strong> Executable TypeScript adapter logic converting conversational state into typed POS payloads.
              </li>
              <li>
                <strong>Root Cause Boundary Localization:</strong> Distinguishing conversational NLU understanding from downstream serialization loss (the &quot;Lost Modifier&quot; defect).
              </li>
              <li>
                <strong>Signal-Style Operational ROI Modeling:</strong> Translating technical error traces into kitchen remake waste, guest experience exposure, and labor hours.
              </li>
              <li>
                <strong>Automated Regression Guarding:</strong> Proving that targeted patches resolve issues without introducing conversational over-generalization regressions.
              </li>
              <li>
                <strong>Bidirectional Engineering Handoff:</strong> Generating Jira/Linear engineering tickets alongside plain-language operator summaries for restaurant GMs.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
