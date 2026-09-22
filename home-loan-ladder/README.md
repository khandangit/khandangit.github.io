# Home Loan Deposit Ladder

Live calculator: https://khandangit.github.io/home-loan-ladder/

A browser-based calculator for comparing Australian owner-occupier principal-and-interest home loans by lender, deposit/LVR tier, LMI, stamp duty and indicative serviceability.

## Source layout

- `index.html` — page structure and calculator inputs/results.
- `styles.css` — stylesheet entry point; imports the readable style sections.
- `styles-1.css` … `styles-6.css` — visual styling, split only to keep source files manageable.
- `rates.js` — lender products, LVR tiers, advertised rates, comparison rates and LMI bands.
- `duty.js` — state and territory stamp-duty and first-home-buyer rules used by the calculator.
- `core.js` — calculations, state handling, loan repayments, LMI and serviceability helpers.
- `render.js` — lender cards, selected-product details, settlement ledger and serviceability output.
- `comparison.js` — seven-lender comparison table and 20% deposit/LVR-cliff analysis.
- `init.js` — UI event bindings and initial render.

## Maintenance

Rates and government rules are time-sensitive. A weekly Home Loan Rate Watch checks official lender and government sources and should update this project only when a documented value or rule changes. Ambiguous changes should be reported rather than guessed.

The figures are candidate estimates, not lending quotes or financial advice. ING Mortgage Simplifier and ME Bank EconoME are included using their published owner-occupier principal-and-interest LVR tiers.
