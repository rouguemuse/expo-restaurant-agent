# Production Failure Taxonomy

Not every failure in a restaurant voice agent is an LLM hallucination. Blaming the model for deterministic configuration, API boundary, or network issues leads to ineffective prompt tweaking instead of robust software fixes.

EXPO classifies every production incident into a precise technical taxonomy:

| Taxonomy Category | Boundary Layer | Example Scenario in EXPO |
|---|---|---|
| **POS MAPPING** | POS Adapter Serializer | **Scenario 1 (Lost Modifier)**: Conversational state has `remove=["onions"]`, but POS transformer drops negative modifiers during payload serialization.<br>**Scenario 2 (Half & Half)**: Toppings assigned to separate halves are flattened into full-pie coverage. |
| **MENU KNOWLEDGE** | Knowledge Retrieval / RAG | **Scenario 3 (Temporal Availability)**: Offering the 11am-3pm Lunch Special at 8:15 PM because knowledge retriever filtered on `active: true` but ignored operating hours windows. |
| **CONVERSATION STATE** | Dialog State Manager | **Scenario 4 (Multi-Turn Quantity)**: Caller orders 2 pizzas, then says "Actually make that three." Agent speaks "three" but state machine fails to mutate line item quantity slot. |
| **SAFETY** | Policy Guardrail Interceptor | **Scenario 5 (Allergy Safety)**: Caller asks if pesto has nuts. Menu lacks guaranteed allergen certification. Agent hallucinates certainty instead of executing mandatory staff escalation. |
| **CONFIGURATION** | Environment / Territory Config | **Scenario 6 (Delivery Zone)**: Telephony pipeline accepts an order destined for an out-of-boundary ZIP code (97035) because geofencing check was bypassed. |
| **WEBHOOK** | Networking / Gateway Queue | **Scenario 7 (Duplicate Order Retry)**: Order submission succeeds at POS, but network acknowledgement times out. Retry worker re-dispatches order without an `Idempotency-Key`, causing the kitchen to print two tickets. |
| **PROMPT** | System Prompt & Few-Shots | Agent tone, phrasing violations, or failure to follow conversation guidance. |
| **TOOL/API** | External Integration RPC | POS API returns 500, network socket disconnects, or authentication token expires. |
| **ESCALATION** | Telephony Transfer Gateway | SIP trunk fails to transfer call to on-premise restaurant line when kitchen transfer is requested. |
| **HALLUCINATION** | LLM Generative Output | Model invents non-existent menu items or inaccurate store pricing not present in the menu graph. |
| **LATENCY** | Streaming ASR / LLM TTFT | Time-to-First-Token exceeds conversational barge-in thresholds (>1500ms). |
