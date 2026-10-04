import React from 'react';
import { AccountHealthMetrics } from '@/types';
import {
  PhoneCall,
  Percent,
  AlertTriangle,
  Clock,
  DollarSign,
  Info,
} from 'lucide-react';

interface AccountHealthProps {
  metrics: AccountHealthMetrics;
}

export function AccountHealth({ metrics }: AccountHealthProps) {
  return (
    <div className="space-y-6">
      {/* Account Overview Card */}
      <div className="bg-zinc-900/90 rounded-lg border border-zinc-800 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-800 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-zinc-100">Sidecar Pizza Co.</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                Tier 1 Enterprise
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Account Health & Telephony Production Operations · High-Volume Pizzeria
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <div>
              <span className="text-zinc-500 block">Agent Quality Score</span>
              <span className="text-emerald-400 font-bold text-sm">
                {metrics.agentQualityScore} / 100
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Containment Rate</span>
              <span className="text-zinc-200 font-bold text-sm">
                {metrics.containmentRatePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div className="p-3.5 rounded bg-zinc-950 border border-zinc-850">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[10px] uppercase font-mono">Total Inbound Calls</span>
              <PhoneCall className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <div className="text-xl font-bold font-mono text-zinc-100">
              {metrics.totalCalls.toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">Past 30 Days</span>
          </div>

          <div className="p-3.5 rounded bg-zinc-950 border border-zinc-850">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[10px] uppercase font-mono">Completed Orders</span>
              <Percent className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {metrics.completedOrders.toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">
              {metrics.orderConversionPercent}% Conversion Rate
            </span>
          </div>

          <div className="p-3.5 rounded bg-zinc-950 border border-zinc-850">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[10px] uppercase font-mono">Staff Escalations</span>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-300">
              {metrics.staffEscalations}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">Warm Staff Transfers</span>
          </div>

          <div className="p-3.5 rounded bg-zinc-950 border border-zinc-850">
            <div className="flex items-center justify-between text-zinc-500 mb-1">
              <span className="text-[10px] uppercase font-mono">Average Latency</span>
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
            </div>
            <div className="text-xl font-bold font-mono text-cyan-300">
              {metrics.averageLatencyMs} ms
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">Voice Turn Response</span>
          </div>
        </div>

        {/* Financial Modeling & Evidence Layer */}
        <div className="mt-5 p-4 rounded-lg bg-zinc-950/60 border border-zinc-800">
          <div className="flex items-center space-x-2 mb-3">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-zinc-200">
              Signal-Style Modeled Financial Impact
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded bg-zinc-900/60 border border-zinc-850">
              <span className="text-[11px] text-zinc-400 font-medium block">
                Estimated Revenue Influenced
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
                ${metrics.estimatedRevenueInfluenced.toLocaleString()}
              </span>
              <p className="text-[11px] text-zinc-500 mt-1">
                Total gross order dollars placed autonomously through voice AI agent.
              </p>
            </div>

            <div className="p-3 rounded bg-rose-950/20 border border-rose-900/40">
              <span className="text-[11px] text-rose-300 font-medium block">
                Estimated Revenue at Risk (Active Defect Exposure)
              </span>
              <span className="text-2xl font-black font-mono text-rose-300 mt-1 block">
                ${metrics.estimatedRevenueAtRisk.toLocaleString()}
              </span>
              <p className="text-[11px] text-zinc-400 mt-1">
                Sum of remakes, guest dissatisfaction, and dropouts across active incidents.
              </p>
            </div>
          </div>

          {/* Model Disclaimer */}
          <div className="mt-4 p-3 rounded bg-zinc-900/80 border border-zinc-850 text-xs text-zinc-400 flex items-start space-x-2">
            <Info className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-300 block text-[11px]">
                Transparent Financial Calculation Methodology:
              </span>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed font-sans">
                {metrics.modeledFinancialDisclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
