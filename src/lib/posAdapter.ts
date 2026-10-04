import {
  AgentOrderState,
  POSOrderPayload,
  POSOrderItemPayload,
  POSItemModifierPayload,
} from '@/types';
import { SIDECAR_MENU_ITEMS, SIDECAR_MODIFIER_GROUPS } from '@/data/menu';

export interface TransformationConfig {
  preserveNegativeModifiers: boolean;
  supportHalfAndHalfSplits: boolean;
  enforceAvailabilityHours: boolean;
  enableIdempotencyGuard: boolean;
}

export const DEFAULT_DEFECTIVE_CONFIG: TransformationConfig = {
  preserveNegativeModifiers: false, // The deliberate defect for Scenario 1!
  supportHalfAndHalfSplits: false,  // The deliberate defect for Scenario 2!
  enforceAvailabilityHours: false,  // Defect for Scenario 3
  enableIdempotencyGuard: false,    // Defect for Scenario 7
};

export const PATCHED_CONFIG: TransformationConfig = {
  preserveNegativeModifiers: true,
  supportHalfAndHalfSplits: true,
  enforceAvailabilityHours: true,
  enableIdempotencyGuard: true,
};

export class MockPOSAdapter {
  private processedIdempotencyKeys = new Set<string>();

  constructor(private config: TransformationConfig = DEFAULT_DEFECTIVE_CONFIG) {}

  public setConfig(newConfig: TransformationConfig): void {
    this.config = { ...newConfig };
  }

  public resetMemory(): void {
    this.processedIdempotencyKeys.clear();
  }

  /**
   * Transforms conversational AgentOrderState into typed POSOrderPayload.
   * Runs actual deterministic business and transformation logic.
   */
  public transformOrder(
    agentState: AgentOrderState,
    callTimestampIso: string = '2026-10-04T12:00:00Z'
  ): {
    payload?: POSOrderPayload;
    success: boolean;
    errorReason?: string;
    isDuplicateRejected?: boolean;
  } {
    // Check idempotency if enabled
    if (this.config.enableIdempotencyGuard) {
      if (this.processedIdempotencyKeys.has(agentState.orderId)) {
        return {
          success: false,
          errorReason: `Idempotency violation: order ${agentState.orderId} already processed`,
          isDuplicateRejected: true,
        };
      }
      this.processedIdempotencyKeys.add(agentState.orderId);
    }

    // Check availability hours if enabled
    if (this.config.enforceAvailabilityHours) {
      const orderDate = new Date(callTimestampIso);
      const orderHour = orderDate.getUTCHours(); // or local hour
      for (const item of agentState.items) {
        const menuItem = SIDECAR_MENU_ITEMS.find((m) => m.id === item.itemId);
        if (menuItem?.availabilityWindow) {
          const { startHour, endHour } = menuItem.availabilityWindow;
          // E.g., lunch special 11 to 15 (3 PM)
          if (orderHour < startHour || orderHour >= endHour) {
            return {
              success: false,
              errorReason: `ITEM_UNAVAILABLE_AT_HOURS: "${menuItem.name}" is only available between ${startHour}:00 and ${endHour}:00. Current order time is ${orderHour}:00.`,
            };
          }
        }
      }
    }

    const lineItems: POSOrderItemPayload[] = [];
    let subtotal = 0;

    for (const item of agentState.items) {
      const posModifiers: POSItemModifierPayload[] = [];
      let itemModifierCost = 0;

      // 1. Process ADD modifiers
      for (const addMod of item.modifiers.add || []) {
        const modMeta = this.resolveModifierMeta(addMod);
        posModifiers.push({
          modifierId: modMeta.id,
          name: modMeta.name,
          action: 'ADD',
          priceDelta: modMeta.priceDelta,
          targetFraction: 'WHOLE',
        });
        itemModifierCost += modMeta.priceDelta;
      }

      // 2. Process REMOVE modifiers (Defect in unpatched mode!)
      if (this.config.preserveNegativeModifiers) {
        for (const remMod of item.modifiers.remove || []) {
          const modMeta = this.resolveModifierMeta(remMod);
          posModifiers.push({
            modifierId: modMeta.id,
            name: modMeta.name,
            action: 'REMOVE',
            priceDelta: 0.0,
            targetFraction: 'WHOLE',
          });
        }
      } else {
        // DEFECTIVE PATH:
        // In unpatched mode, negative modifiers are dropped during serialization because
        // the legacy serializer only iterated over positive addition objects!
        // This is the root cause of Scenario 1!
      }

      // 3. Process Half-and-Half pizza toppings (Scenario 2)
      if (item.modifiers.halfOneAdd || item.modifiers.halfTwoAdd) {
        if (this.config.supportHalfAndHalfSplits) {
          for (const h1 of item.modifiers.halfOneAdd || []) {
            const meta = this.resolveModifierMeta(h1);
            posModifiers.push({
              modifierId: meta.id,
              name: `${meta.name} (1st Half)`,
              action: 'ADD',
              priceDelta: meta.priceDelta * 0.5,
              targetFraction: 'FIRST_HALF',
            });
            itemModifierCost += meta.priceDelta * 0.5;
          }
          for (const h2 of item.modifiers.halfTwoAdd || []) {
            const meta = this.resolveModifierMeta(h2);
            posModifiers.push({
              modifierId: meta.id,
              name: `${meta.name} (2nd Half)`,
              action: 'ADD',
              priceDelta: meta.priceDelta * 0.5,
              targetFraction: 'SECOND_HALF',
            });
            itemModifierCost += meta.priceDelta * 0.5;
          }
        } else {
          // DEFECTIVE PATH for Scenario 2:
          // Unpatched adapter flattens all half toppings into WHOLE pizza additions
          for (const h of [...(item.modifiers.halfOneAdd || []), ...(item.modifiers.halfTwoAdd || [])]) {
            const meta = this.resolveModifierMeta(h);
            posModifiers.push({
              modifierId: meta.id,
              name: meta.name,
              action: 'ADD',
              priceDelta: meta.priceDelta,
              targetFraction: 'WHOLE', // Bug: whole pizza applied!
            });
            itemModifierCost += meta.priceDelta;
          }
        }
      }

      const itemTotal = (item.unitPrice + itemModifierCost) * item.quantity;
      subtotal += itemTotal;

      lineItems.push({
        posItemId: `pos_${item.itemId}`,
        name: item.itemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        modifiers: posModifiers,
        subtotal: itemTotal,
        specialInstructions: item.notes,
      });
    }

    const taxAmount = Number((subtotal * 0.0825).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));

    const payload: POSOrderPayload = {
      idempotencyKey: `pos_tx_${agentState.orderId}`,
      externalOrderId: agentState.orderId,
      restaurantId: 'rest_sidecar_01',
      channel: 'VOICE_AGENT',
      orderType: agentState.orderType,
      deliveryDetails: agentState.deliveryZip
        ? { zipCode: agentState.deliveryZip, validated: true }
        : undefined,
      lineItems,
      taxAmount,
      totalAmount,
      submittedAt: new Date().toISOString(),
      metadata: {
        rawStateItemsCount: agentState.items.length,
        configUsed: this.config,
      },
    };

    return { payload, success: true };
  }

  private resolveModifierMeta(rawName: string): { id: string; name: string; priceDelta: number } {
    const clean = rawName.toLowerCase().trim();
    for (const mg of SIDECAR_MODIFIER_GROUPS) {
      for (const opt of mg.options) {
        if (opt.name.toLowerCase().includes(clean) || clean.includes(opt.name.toLowerCase())) {
          return { id: opt.id, name: opt.name, priceDelta: opt.priceDelta };
        }
      }
    }
    // Fallback normalization
    return {
      id: `mod_${clean.replace(/[^a-z0-9]/g, '_')}`,
      name: rawName,
      priceDelta: 0.0,
    };
  }
}
