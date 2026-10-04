import React, { useState } from 'react';
import { Trace, TraceEvent } from '@/types';
import {
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Layers,
  FileCode,
  Flame,
} from 'lucide-react';

interface TraceViewerProps {
  trace: Trace;
}

export function TraceViewer({ trace }: TraceViewerProps) {
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({
    evt_06: true,
    evt_09: true,
    evt_10: true,
    evt_11: true,
  });

  const toggleEvent = (id: string) => {
    setExpandedEvents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status: TraceEvent['status']) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <CheckCircle className="w-2.5 h-2.5" />
            <span>200 OK</span>
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/80 text-rose-300 border border-rose-800">
            <AlertCircle className="w-2.5 h-2.5" />
            <span>DEFECT</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/50">
            <AlertCircle className="w-2.5 h-2.5" />
            <span>WARN</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400">
            <span>INFO</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-zinc-900/90 rounded-lg border border-zinc-800 overflow-hidden shadow-xl flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-zinc-200">Execution Trace</span>
          </div>
          <span className="font-mono text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            {trace.traceId}
          </span>
          <span className="text-xs text-zinc-500">·</span>
          <span className="text-xs text-zinc-400">Duration: {trace.totalDurationMs}ms</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-zinc-400 font-mono">
            {trace.events.length} Events captured
          </span>
          <button
            onClick={() => {
              const allExpanded: Record<string, boolean> = {};
              trace.events.forEach((e) => (allExpanded[e.id] = true));
              setExpandedEvents(allExpanded);
            }}
            className="text-[11px] px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition"
          >
            Expand All
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="divide-y divide-zinc-850 overflow-y-auto max-h-[580px] p-2 space-y-1">
        {trace.events.map((event, index) => {
          const isExpanded = !!expandedEvents[event.id];
          const isDefect = event.metadata?.hasDefectHere || event.status === 'ERROR';

          return (
            <div
              key={event.id}
              className={`rounded border transition-all ${
                isDefect
                  ? 'bg-rose-950/20 border-rose-900/60 shadow-inner'
                  : 'bg-zinc-950/40 border-zinc-800/60 hover:border-zinc-700/80'
              }`}
            >
              {/* Event Bar */}
              <div
                onClick={() => toggleEvent(event.id)}
                className="px-3 py-2 flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-zinc-600 hover:text-zinc-300">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500 w-5">#{index + 1}</span>
                  <span
                    className={`font-mono text-xs font-semibold ${
                      isDefect ? 'text-rose-300' : 'text-zinc-200'
                    }`}
                  >
                    {event.name}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900/80 px-1.5 py-0.5 rounded border border-zinc-850">
                    {event.metadata.component}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[11px] font-mono text-zinc-500 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-zinc-600" />
                    <span>{event.durationMs}ms</span>
                  </span>
                  {getStatusBadge(event.status)}
                </div>
              </div>

              {/* Defect Alert Box if flagged */}
              {isDefect && event.metadata.defectExplanation && (
                <div className="mx-3 mb-2 p-2.5 rounded bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs flex items-start space-x-2">
                  <Flame className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-rose-300 block uppercase tracking-wider text-[10px]">
                      Boundary Failure Identified
                    </span>
                    <p className="mt-0.5 text-xs text-rose-100/90 leading-relaxed font-sans">
                      {event.metadata.defectExplanation}
                    </p>
                  </div>
                </div>
              )}

              {/* Expanded JSON Inspector */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-zinc-800/50 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="flex items-center justify-between text-[10px] uppercase font-mono text-zinc-400 mb-1">
                      <span>Input Payload</span>
                      <FileCode className="w-3 h-3 text-zinc-600" />
                    </div>
                    <pre className="p-2 rounded bg-zinc-950 border border-zinc-850 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-48">
                      {JSON.stringify(event.input, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[10px] uppercase font-mono text-zinc-400 mb-1">
                      <span>Output State</span>
                      <FileCode className="w-3 h-3 text-zinc-600" />
                    </div>
                    <pre className="p-2 rounded bg-zinc-950 border border-zinc-850 font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-48">
                      {JSON.stringify(event.output, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
