# Functional Failure Scenarios Catalog

### Scenario 1: The Lost Modifier (Target Vertical Slice)
- **Customer Utterance**: "I'll do the double cheeseburger, no onions, extra pickles."
- **Verbal Output**: "Double cheeseburger, no onions, extra pickles."
- **Internal State**: `modifiers: { add: ["extra pickles"], remove: ["onions"] }`
- **Defective POS Output**: `modifiers: [{ name: "Extra Pickles", action: "ADD" }]` (Onions dropped)
- **Root Cause**: `MockPOSAdapter` iterated over additions but omitted negative exclusions.
- **Resolution**: Added loop serializing `item.modifiers.remove` with `{ action: 'REMOVE' }`.

---

### Scenario 2: Half-and-Half Pizza State
- **Customer Utterance**: "Large pizza, half pepperoni and half mushroom."
- **Internal State**: `halfOneAdd: ["Pepperoni"], halfTwoAdd: ["Cremini Mushrooms"]`
- **Defective POS Output**: Both toppings mapped to `targetFraction: "WHOLE"`, charging 100% price and covering the entire pie.
- **Root Cause**: Lack of fraction modifier translation logic in adapter.
- **Resolution**: Enabled fractional split mapping with `targetFraction: "FIRST_HALF" | "SECOND_HALF"` and 50% topping pricing.

---

### Scenario 3: Temporal Menu Availability
- **Customer Utterance**: "Can I get that lunch special with the two slices and a drink?" (Calling at 8:15 PM)
- **Defective Behavior**: Agent accepts and prices at $9.95.
- **Root Cause**: Menu catalog query failed to validate current order hour (20:15) against `availabilityWindow: { startHour: 11, endHour: 15 }`.
- **Resolution**: Enforced temporal availability checks returning alternative dinner recommendations.

---

### Scenario 4: Multi-Turn Quantity State
- **Customer Utterance Turn 1**: "Two pepperoni pizzas."
- **Customer Utterance Turn 2**: "Actually make that three."
- **Defective POS Output**: Quantity remained 2 despite verbal acknowledgment of 3.
- **Root Cause**: Conversational state machine failed to trigger slot mutation on quantity revision.

---

### Scenario 5: Allergy Safety Policy Violation
- **Customer Utterance**: "Does your pesto sandwich have nuts? My daughter has a severe tree nut allergy."
- **Defective Behavior**: Agent stated pesto was nut-free with unwarranted confidence. (Sidecar pesto contains pine nuts and walnuts).
- **Root Cause**: Missing safety guardrail interceptor for high-risk allergens.
- **Resolution**: Policy guardrail strictly mandates warm staff escalation for unverified allergen inquiries.

---

### Scenario 6: Delivery Zone Boundary Violation
- **Customer Utterance**: "Can I get a large pizza delivered to 97035?" (11 miles away)
- **Defective Behavior**: Agent accepted delivery.
- **Root Cause**: Address validator bypassed delivery geofence configuration (`maxRadiusMiles: 6.5`).
- **Resolution**: Inbound address interceptor verifies customer ZIP against allowed delivery territory and pivots to pickup.

---

### Scenario 7: Duplicate Order via Webhook Retry
- **Incident**: Order submission succeeded at POS, but network acknowledgement timed out after 3000ms.
- **Defective Behavior**: Webhook retry worker submitted a second request with a fresh ID, creating two kitchen tickets.
- **Root Cause**: Omission of deterministic `Idempotency-Key` on retry dispatches.
- **Resolution**: Mock POS enforces idempotency cache keyed on `pos_tx_{orderId}` to deduplicate network retries.
