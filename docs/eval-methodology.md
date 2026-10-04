# Evaluation Methodology & Regression Guarding

## 1. Principles of Deterministic Evals in Voice AI
In restaurant voice AI, prompt engineering alone cannot guarantee operational reliability. Systems must evaluate the entire pipeline from speech recognition down to the POS JSON serialization.

A common antipattern in AI observability is asserting on prewritten strings or displaying static passing indicators. EXPO executes **deterministic evaluation logic** in TypeScript on every run:

1. Synthetic conversational input text is fed through state structuring.
2. Structured state is passed to the real `MockPOSAdapter`.
3. Strict assertions verify:
   - Presence of expected positive additions
   - Presence of expected negative exclusions
   - Exact item count and split fractions
   - Negative assertion: absence of unintended removals

---

## 2. Negation Idioms Evaluated (Scenario 1 Matrix)

| Test ID | Input Utterance | Linguistic Challenge | Expected POS Removal |
|---|---|---|---|
| `eval_s1_01` | "Double cheeseburger, no onions, extra pickles." | Standard compound modifier | `Onions` |
| `eval_s1_02` | "Hold the onions on that cheeseburger." | Restaurant slang / imperative | `Onions` |
| `eval_s1_03` | "Double cheeseburger without onion." | Prepositional exclusion | `Onions` |
| `eval_s1_04` | "Double cheeseburger, everything except onions." | Exception phrasing | `Onions` |
| `eval_s1_05` | "Take the onions off the double cheeseburger." | Phrasal verb exclusion | `Onions` |
| `eval_s1_06` | "No onion please on the burger." | Polite fronted negation | `Onions` |
| `eval_s1_07` | "Extra pickle, no onion." | Compressed telegraphic speech | `Onions` |
| `eval_s1_08` | "Burger plain, only meat and cheese." | Implicit exclusion of all standard toppings | `Onions`, `Pickles`, `Special Sauce` |
| `eval_s1_09` | "Double cheeseburger with no onions or tomato." | Multi-target negative coordination | `Onions`, `Tomato` |
| `eval_s1_10` | "Keep everything except the onion." | Double constraint syntax | `Onions` |
| `eval_s1_11` | "Wait, no, onions are fine. Extra pickles only." | **Regression Guard: Discursive 'No'** | *Must NOT remove onions* |

---

## 3. The Critical Regression Guard Principle
> *"A fix is not complete because the original example works. It is complete when the relevant behavior survives regression testing."*

If an engineer fixes the "no onions" bug using a naive pattern match that matches `\bno\b.*\bonions?\b`, it will cause:
`"Wait, no, onions are fine."` -> `REMOVE Onions`

The customer explicitly stated they **want** onions, but the naive fix caused a food remaking error! EXPO's regression suite actively checks `eval_s1_11_regression_guard` to enforce that negation fixes do not over-generalize.
