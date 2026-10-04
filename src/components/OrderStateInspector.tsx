import React from 'react';
import { AgentOrderState, POSOrderPayload } from '@/types';
import { CheckCircle2, XCircle, AlertCircle, Layers } from 'lucide-react';

interface OrderStateInspectorProps {
  orderState: AgentOrderState;
  posPayload?: POSOrderPayload;
  scenarioSubtitle?: string;
}

export function OrderStateInspector({
  orderState,
  posPayload,
  scenarioSubtitle,
}: OrderStateInspectorProps) {
  const firstItem = orderState.items[0];
  const firstPosItem = posPayload?.lineItems?.[0];

  const hasNegativeInConv = (firstItem?.modifiers?.remove?.length || 0) > 0;
  const hasNegativeInPos =
    (firstPosItem?.modifiers?.filter((m) => m.action === 'REMOVE')?.length || 0) > 0;

  const isModifierLost = hasNegativeInConv && !hasNegativeInPos;

  return (
    <div className="bg-zinc-900/90 rounded-lg border border-zinc-800 overflow-hidden shadow-xl">
      <div className="px-4 py-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-zinc-200">
            Order State Inspector: Conversational Layer vs POS Payload
          </span>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Order ID: {orderState.orderId}
        </span>
      </div>

      {scenarioSubtitle && (
        <div className="px-4 py-1.5 bg-zinc-950/40 border-b border-zinc-850 text-[11px] text-zinc-400">
          {scenarioSubtitle}
        </div>
      )}

      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Layer 1: Conversational Order State */}
        <div className="border border-zinc-800 rounded-md p-3 bg-zinc-950/60">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-850">
            <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Layer 1: Agent Conversational State</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
              NLU / DIALOG
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-zinc-500">customer_intent:</span>{' '}
              <span className="text-emerald-300 font-bold">{orderState.customerIntent}</span>
            </div>
            <div>
              <span className="text-zinc-500">order_type:</span>{' '}
              <span className="text-zinc-300">{orderState.orderType}</span>
            </div>
            <div>
              <span className="text-zinc-500">item:</span>{' '}
              <span className="text-zinc-200 font-bold">{firstItem?.itemName}</span>{' '}
              <span className="text-zinc-500 font-bold text-amber-300">(qty: {firstItem?.quantity})</span>
            </div>

            {/* Split toppings for Scenario 2 */}
            {(firstItem?.modifiers?.halfOneAdd || firstItem?.modifiers?.halfTwoAdd) && (
              <div className="mt-2 pt-2 border-t border-zinc-850">
                <span className="text-zinc-500 block mb-1">fractional_splits:</span>
                <div className="pl-2 space-y-1">
                  <div className="text-cyan-300">
                    1st Half: {JSON.stringify(firstItem.modifiers.halfOneAdd)}
                  </div>
                  <div className="text-amber-300">
                    2nd Half: {JSON.stringify(firstItem.modifiers.halfTwoAdd)}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-2 pt-2 border-t border-zinc-850">
              <span className="text-zinc-500 block mb-1">modifiers:</span>
              <div className="space-y-1 pl-2">
                <div className="flex items-center space-x-2">
                  <span className="text-emerald-400 text-[11px] font-semibold">ADD:</span>
                  <span className="text-zinc-300">
                    {firstItem?.modifiers?.add?.length
                      ? JSON.stringify(firstItem.modifiers.add)
                      : '[]'}
                  </span>
                </div>
                <div
                  className={`flex items-center space-x-2 p-1 rounded ${
                    isModifierLost ? 'bg-amber-950/40 border border-amber-800/60' : ''
                  }`}
                >
                  <span className="text-rose-400 text-[11px] font-semibold">REMOVE:</span>
                  <span className="text-rose-200 font-bold">
                    {firstItem?.modifiers?.remove?.length
                      ? JSON.stringify(firstItem.modifiers.remove)
                      : '[]'}
                  </span>
                  {hasNegativeInConv && (
                    <span className="text-[10px] text-emerald-400 ml-auto bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-800">
                      captured correctly
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layer 2: Mock POS Payload */}
        <div
          className={`border rounded-md p-3 ${
            isModifierLost
              ? 'border-rose-900/80 bg-rose-950/20 shadow-inner'
              : 'border-zinc-800 bg-zinc-950/60'
          }`}
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-850">
            <span className="text-xs font-semibold text-cyan-400 flex items-center space-x-1">
              {isModifierLost ? (
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>Layer 2: POS Order Payload (Kitchen Ticket)</span>
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isModifierLost
                  ? 'bg-rose-900/60 text-rose-200 border border-rose-700'
                  : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {isModifierLost ? 'PAYLOAD ANOMALY' : 'VALIDATED'}
            </span>
          </div>

          {posPayload ? (
            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-zinc-500">idempotencyKey:</span>{' '}
                <span className="text-zinc-400">{posPayload.idempotencyKey}</span>
              </div>
              <div>
                <span className="text-zinc-500">line_items:</span>{' '}
                <span className="text-zinc-200 font-bold">{firstPosItem?.name}</span>{' '}
                <span className="text-zinc-500 font-bold text-amber-300">(qty: {firstPosItem?.quantity})</span>
              </div>

              <div className="mt-2 pt-2 border-t border-zinc-850">
                <span className="text-zinc-500 block mb-1">serialized_modifiers:</span>
                <div className="space-y-1 pl-2">
                  {firstPosItem?.modifiers && firstPosItem.modifiers.length > 0 ? (
                    firstPosItem.modifiers.map((mod, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-1 rounded ${
                          mod.action === 'REMOVE'
                            ? 'bg-rose-950/50 text-rose-200'
                            : 'bg-zinc-900 text-emerald-300'
                        }`}
                      >
                        <span className="font-semibold">
                          {mod.action === 'REMOVE' ? '[-] REMOVE ' : '[+] ADD '}
                          {mod.name}{' '}
                          {mod.targetFraction && (
                            <span className="text-zinc-400 text-[10px]">
                              ({mod.targetFraction})
                            </span>
                          )}
                        </span>
                        <span className="text-zinc-500 text-[10px]">
                          +${mod.priceDelta.toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-zinc-500 italic">No modifiers serialized</span>
                  )}
                </div>

                {/* VISIBLE PROOF WARNING */}
                {isModifierLost && (
                  <div className="mt-3 p-2 rounded bg-rose-950/70 border border-rose-800 text-[11px] text-rose-200">
                    <div className="font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                      <span>Boundary Serialization Anomaly</span>
                    </div>
                    <p className="mt-1 font-sans text-rose-100">
                      Conversational state holds <code className="bg-rose-900/50 px-1">remove: [&quot;onions&quot;]</code>, but POS payload serialized 0 removal modifiers. The kitchen will make this cheeseburger with default onions!
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-zinc-500 text-xs italic">
              POS Payload not generated or rejected by availability rule.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
