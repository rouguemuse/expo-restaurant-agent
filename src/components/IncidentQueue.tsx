import React from 'react';
import { Incident } from '@/types';
import {
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface IncidentQueueProps {
  incidents: Incident[];
  selectedIncidentId: string;
  onSelectIncident: (id: string) => void;
}

export function IncidentQueue({
  incidents,
  selectedIncidentId,
  onSelectIncident,
}: IncidentQueueProps) {
  const getSeverityBadge = (severity: Incident['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-950 text-yellow-300 border border-yellow-800">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400">
            LOW
          </span>
        );
    }
  };

  const getCategoryBadge = (category: Incident['failureCategory']) => {
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-cyan-300 border border-zinc-700">
        {category}
      </span>
    );
  };

  return (
    <div className="bg-zinc-900/90 rounded-lg border border-zinc-800 overflow-hidden shadow-xl">
      <div className="px-4 py-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-zinc-200">
            Active Restaurant Incidents Queue
          </span>
          <span className="text-xs text-zinc-500">·</span>
          <span className="text-xs text-zinc-400 font-mono">
            {incidents.length} Detected Issues
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Filter: All Categories (Prompt, State, POS, Webhook, Safety)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="px-3 py-2.5">ID</th>
              <th className="px-3 py-2.5">Severity</th>
              <th className="px-3 py-2.5">Failure Category</th>
              <th className="px-3 py-2.5">Incident Title</th>
              <th className="px-3 py-2.5">Calls Affected</th>
              <th className="px-3 py-2.5">Revenue Exposure</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850">
            {incidents.map((inc) => {
              const isSelected = inc.id === selectedIncidentId;
              return (
                <tr
                  key={inc.id}
                  onClick={() => onSelectIncident(inc.id)}
                  className={`cursor-pointer transition ${
                    isSelected
                      ? 'bg-amber-950/20 border-l-2 border-amber-400'
                      : 'hover:bg-zinc-800/40 bg-zinc-900/10'
                  }`}
                >
                  <td className="px-3 py-3 font-bold text-amber-400">{inc.id}</td>
                  <td className="px-3 py-3">{getSeverityBadge(inc.severity)}</td>
                  <td className="px-3 py-3">{getCategoryBadge(inc.failureCategory)}</td>
                  <td className="px-3 py-3 font-sans font-medium text-zinc-200 max-w-xs truncate">
                    {inc.title}
                  </td>
                  <td className="px-3 py-3 text-zinc-300">
                    {inc.affectedCallsCount} calls ({inc.reproductionRatePercent}%)
                  </td>
                  <td className="px-3 py-3 text-emerald-400 font-semibold">
                    ${inc.estimatedRevenueExposure.toFixed(2)}
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(inc.id);
                      }}
                      className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center space-x-1"
                    >
                      <span>Diagnose</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
