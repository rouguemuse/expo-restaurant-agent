import React, { useState } from 'react';
import { Call, Trace } from '@/types';
import { Phone, User, Bot } from 'lucide-react';
import { TraceViewer } from './TraceViewer';

interface CallExplorerProps {
  calls: Call[];
  traces: Trace[];
  selectedCallId?: string;
}

export function CallExplorer({ calls, traces, selectedCallId: initialCallId }: CallExplorerProps) {
  const [selectedCallId, setSelectedCallId] = useState<string>(initialCallId || calls[0].id);

  const selectedCall = calls.find((c) => c.id === selectedCallId) || calls[0];
  const selectedTrace = traces.find((t) => t.traceId === selectedCall.traceId);

  return (
    <div className="space-y-4">
      {/* Calls Selector Strip */}
      <div className="bg-zinc-900/90 rounded-lg border border-zinc-800 p-3 shadow-xl">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-zinc-200">
              Inbound Call Logs ({calls.length} Synthetic Telephony Sessions)
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Click call to inspect conversational transcript & linked trace
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {calls.map((c) => {
            const isSelected = c.id === selectedCallId;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCallId(c.id)}
                className={`p-2.5 rounded border cursor-pointer transition select-none ${
                  isSelected
                    ? 'border-amber-500 bg-amber-950/20'
                    : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-zinc-200">{c.id}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded ${
                      c.outcome === 'ORDER_DEFECT'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {c.outcome}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-1 truncate">
                  {c.scenarioTag.replace(/_/g, ' ')}
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                  <span>{c.durationSeconds}s duration</span>
                  <span>{c.customerPhone}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main split: Transcript & Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Transcript Panel */}
        <div className="lg:col-span-5 bg-zinc-900/90 rounded-lg border border-zinc-800 p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs font-bold text-zinc-200 flex items-center space-x-1.5">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Call Audio Transcript: {selectedCall.id}</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                Scenario: {selectedCall.scenarioTag}
              </span>
            </div>

            <div className="divide-y divide-zinc-850 mt-3 space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {selectedCall.transcript.map((turn, idx) => {
                const isUser = turn.speaker === 'user';
                return (
                  <div key={idx} className="pt-2 flex items-start space-x-2.5 text-xs">
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                        isUser
                          ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}
                    >
                      {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-0.5">
                        <span className="font-semibold text-zinc-400">
                          {isUser ? 'Caller (Customer)' : 'Sidecar Voice Agent'}
                        </span>
                        <span>{turn.timestamp}</span>
                      </div>
                      <div
                        className={`p-2 rounded font-sans leading-relaxed text-xs ${
                          isUser
                            ? 'bg-zinc-950 text-zinc-200 border border-zinc-850'
                            : 'bg-zinc-900/80 text-zinc-300 border border-zinc-800'
                        }`}
                      >
                        {turn.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 text-xs font-mono text-zinc-400 flex items-center justify-between">
            <span>Linked Trace ID: {selectedCall.traceId}</span>
            <span className="text-[11px] text-amber-400">Inspected in right panel →</span>
          </div>
        </div>

        {/* Trace Panel */}
        <div className="lg:col-span-7">
          {selectedTrace ? (
            <TraceViewer trace={selectedTrace} />
          ) : (
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-8 text-center text-zinc-500 text-xs">
              No execution trace found for this call ID.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
