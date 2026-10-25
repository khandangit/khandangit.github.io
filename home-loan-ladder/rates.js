"use strict";
  /* ============================================================
     RATE DATA — owner-occupier, principal & interest, new lending
     ============================================================ */
  var LENDERS = [
    {
      id:"westpac", name:"Westpac", asOf:"19 Oct 2026",
      products:[
        { schemeLender:"westpac", id:"flexi", name:"Flexi First Option (Online Offer)", annualFee:0, upfrontFee:100,
          blurb:"Online applications only, up to 80% LVR. No offset; excludes internal Westpac Group refinances. $100 document processing fee.",
          tiers:[{max:70,rate:6.24,comp:6.25},{max:80,rate:6.34,comp:6.35}] },
        { schemeLender:"westpac", id:"flexiStd", name:"Flexi First Option (standard discount)", annualFee:0, upfrontFee:100,
          blurb:"Non-online discounted offer, including loans over 80% LVR. $100 document processing fee. LMI may apply.",
          tiers:[{max:70,rate:6.69,comp:6.70},{max:80,rate:6.79,comp:6.80},{max:95,rate:7.09,comp:7.10}] }
      ],
      lowDeposit:"The Flexi First Online Offer ends at 80% LVR (6.34% in the 70–80% tier). Above 80%, Westpac publishes a separate standard discounted Flexi First rate of 7.09% through 95% LVR. Westpac participates in the 5% Deposit Scheme, but a guarantee and no-LMI treatment require individual eligibility and product confirmation."
    },
    {
      id:"macquarie", name:"Macquarie", asOf:"19 Oct 2026",
      products:[
        { id:"basic", name:"Basic Home Loan", annualFee:0, upfrontFee:350,
          blurb:"No ongoing fees, free redraw, no offset. $350 documentation fee at settlement.",
          tiers:[{max:60,rate:6.29,comp:6.31},{max:70,rate:6.29,comp:6.31},{max:80,rate:6.34,comp:6.36},{max:90,rate:6.54,comp:6.57},{max:95,rate:7.34,comp:7.37}] },
        { id:"offset", name:"Offset Home Loan", annualFee:248, upfrontFee:350,
          blurb:"Same interest rate as Basic, plus up to 10 offset accounts for a $248 annual facility fee.",
          tiers:[{max:60,rate:6.29,comp:6.54},{max:70,rate:6.29,comp:6.54},{max:80,rate:6.34,comp:6.59},{max:90,rate:6.54,comp:6.79},{max:95,rate:7.34,comp:7.58}] },
        { id:"fix3", name:"3-year Fixed (Basic)", annualFee:0, upfrontFee:350, fixed:true,
          blurb:"Fixed for 3 years, then reverts to the variable rate then applying. Extra repayments capped at $10,000 a year.",
          tiers:[{max:70,rate:6.59,comp:6.40},{max:80,rate:6.64,comp:6.45},{max:95,rate:6.94,comp:7.25}] }
      ],
      lowDeposit:"Macquarie Basic moves from 6.34% at 80% to 6.54% at 90% (+20 bp), then to 7.34% above 90%. Macquarie is not listed as a participating lender in the Australian Government 5% Deposit Scheme."
    },
    {
      id:"ing", name:"ING", asOf:"9 Oct 2026 (comparison rates unverified)",
      products:[
        { id:"simplifier", name:"Mortgage Simplifier", annualFee:0, upfrontFee:350,
          blurb:"No monthly or annual fees, unlimited extra repayments and redraw. No offset. $150,000 minimum total borrowings; $350 settlement fee.",
          tiers:[{max:60,rate:6.29,comp:null},{max:70,rate:6.29,comp:null},{max:80,rate:6.34,comp:null},{max:90,rate:6.49,comp:null},{max:95,rate:6.94,comp:null}] }
      ],
      lowDeposit:"ING announced a 0.25 percentage-point rise for new and existing variable loans effective 9 October 2026. Mortgage Simplifier rates here apply that announced increase to the previously published LVR tiers (6.34% at 80%, 6.49% at 90%, 6.94% at 95%); comparison rates await a readable updated ING rate table. ING is not a participating 5% Deposit Scheme lender."
    },
    {
      id:"me", name:"ME Bank", asOf:"3 Oct 2026 (announced +0.25pp)",
      products:[
        { id:"econome", name:"EconoME Home Loan", annualFee:0, upfrontFee:150,
          blurb:"No annual fee, unlimited additional repayments on variable loans, redraw of extra repayments, and a $150 settlement fee. Advertised P&I rates below are for total borrowings of $150,000 or more.",
          tiers:[{max:60,rate:6.24,comp:6.26},{max:70,rate:6.24,comp:6.26},{max:80,rate:6.29,comp:6.31},{max:90,rate:6.59,comp:6.61},{max:95,rate:7.29,comp:7.31}] }
      ],
      lowDeposit:"EconoME publishes a 30 bp step from 6.29% at 80% LVR to 6.59% at 90%, then a larger 70 bp step to 7.29% in the 90.01–95% band. ME announced a 0.25 percentage-point increase effective 3 October 2026; these tiers apply the announced increase to its prior published rate card. The product page states a maximum LVR of up to 95%. Rates are for new owner-occupier principal-and-interest lending and remain subject to ME's credit approval and valuation."
    },
    {
      id:"cba", name:"CommBank", asOf:"9 Oct 2026 (Digi/Simple; other products older)",
      products:[
        { schemeLender:"cba", id:"digi", name:"Digi Home Loan", annualFee:0, upfrontFee:300,
          blurb:"Online only (no brokers), capped at 80% LVR. $300 establishment fee; no loan service fee or offset feature fee.",
          tiers:[{max:60,rate:6.34,comp:6.36},{max:70,rate:6.37,comp:6.39},{max:80,rate:6.39,comp:6.41}] },
        { schemeLender:"cba", id:"simple", name:"Simple Home Loan", annualFee:120, upfrontFee:300, feeNote:"$10/mo service fee",
          blurb:"Up to two offsets at no extra feature fee. $300 establishment fee and $10 monthly loan service fee from 1 October 2026.",
          tiers:[{max:60,rate:6.59,comp:6.73},{max:70,rate:6.64,comp:6.78},{max:80,rate:6.74,comp:6.88},{max:90,rate:7.04,comp:7.18},{max:95,rate:7.99,comp:8.13}] },
        { schemeLender:"cba", id:"svr", name:"Standard Variable + Wealth Package", annualFee:395, upfrontFee:0,
          blurb:"0.70% p.a. package discount already applied. Multiple offsets, splits, top-ups. $395 annual package fee.",
          tiers:[{max:60,rate:6.34,comp:6.72},{max:70,rate:6.39,comp:6.77},{max:80,rate:6.49,comp:6.87},{max:90,rate:6.79,comp:7.16},{max:95,rate:7.74,comp:8.10}] },
        { schemeLender:"cba", id:"fix2", name:"2-year Fixed + Wealth Package", annualFee:395, upfrontFee:0, fixed:true,
          blurb:"Fixed 2 years, then reverts to Standard Variable less the package discount. No offset while fixed.",
          tiers:[{max:95,rate:6.34,comp:8.09}] }
      ],
      lowDeposit:"Digi stops at 80% LVR, so the published Simple Home Loan is a low-deposit alternative: 6.74% at 80%, 7.04% at 90%, and 7.99% at 95%. CommBank participates in the 5% Deposit Scheme; product eligibility and borrower approval must be confirmed. Standard Variable package tiers in this tool have not been reverified for October."
    },
    {
      id:"anz", name:"ANZ", asOf:"9 Oct 2026 (index rise; tier discounts carried forward)",
      products:[
        { schemeLender:"anz", id:"simplicity", name:"Simplicity PLUS", annualFee:0, upfrontFee:0,
          blurb:"No setup or ongoing fees, free redraw, no offset. Requires an eligible ANZ everyday or savings account. $50,000 minimum.",
          tiers:[{max:60,rate:6.64,comp:6.64},{max:70,rate:6.69,comp:6.69},{max:80,rate:6.79,comp:6.79},{max:90,rate:7.34,comp:7.34},{max:95,rate:7.89,comp:7.89}] }
      ],
      lowDeposit:"Simplicity PLUS steps 55 bp at the 80% line — 6.79% to 7.34% — and increases to 7.89% above 90% LVR (shown through 95% here, subject to lending approval and LMI or scheme eligibility). ANZ announced a 0.25 percentage-point increase effective 9 October 2026; the rates shown apply that change to previously published discount tiers, which should be confirmed with ANZ before relying on a quote. ANZ's Standard Variable is priced by negotiation with separate discount margins above and below 80% LVR, so it is not modelled here. Worth asking about separately: a $3,000 cashback for eligible first home buyers borrowing $250,000 or more, and an LMI waiver for eligible professionals, which can be worth more than any rate difference on this page."
    },
    {
      id:"nab", name:"NAB", asOf:"9 Oct 2026 (Base Variable)",
      products:[
        { schemeLender:"nab", id:"base", name:"Base Variable Rate", annualFee:0, upfrontFee:0,
          blurb:"No application or ongoing fees. One published rate, not tiered by LVR — unusual among the majors.",
          tiers:[{max:95,rate:6.69,comp:6.69}] },
        { schemeLender:"nab", id:"tailored", name:"Tailored Variable + offset", annualFee:0, upfrontFee:0, indicative:true,
          blurb:"Rate individually negotiated. Shown at the ceiling of NAB's current published range for 60–70% LVR — an upper bound, not a quote.",
          tiers:[{max:70,rate:7.04,comp:7.16}] }
      ],
      lowDeposit:"NAB Base Variable is published at 6.69% P&I across its eligible LVRs, with lending up to 95% subject to approval. LMI normally applies above 80% unless an eligible waiver or guarantee applies. NAB participates in the 5% Deposit Scheme. Tailored Variable pricing is negotiated; the indicative row shows the upper end of the published 60–70% LVR range, not a personal quote."
    }
  ];

  /* LMI: indicative full-doc premium, % of loan. Midpoints of published ranges. */
  var LMI_TABLE = [
    { lvrMax:85, bands:[[300000,0.601],[500000,0.769],[600000,1.035],[750000,1.119],[Infinity,1.160]] },
    { lvrMax:90, bands:[[300000,1.086],[500000,1.351],[600000,1.603],[750000,1.813],[Infinity,1.929]] },
    { lvrMax:95, bands:[[300000,2.311],[500000,2.982],[600000,3.756],[750000,4.198],[Infinity,4.212]] }
  ];

