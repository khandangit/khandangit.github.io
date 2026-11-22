"use strict";
  /* ============================================================
     RATE DATA — owner-occupier, principal & interest, new lending
     ============================================================ */
  var LENDERS = [
    {
      id:"westpac", name:"Westpac", asOf:"13 Nov 2026 (announced +0.25pp; tier estimates)",
      products:[
        { schemeLender:"westpac", id:"flexi", name:"Flexi First Option (Online Offer)", annualFee:0, upfrontFee:100,
          blurb:"Online applications only, up to 80% LVR. No offset; excludes internal Westpac Group refinances. $100 document processing fee.",
          tiers:[{max:70,rate:6.49,comp:null},{max:80,rate:6.59,comp:null}] },
        { schemeLender:"westpac", id:"flexiStd", name:"Flexi First Option (standard discount)", annualFee:0, upfrontFee:100,
          blurb:"Non-online discounted offer, including loans over 80% LVR. $100 document processing fee. LMI may apply.",
          tiers:[{max:70,rate:6.94,comp:null},{max:80,rate:7.04,comp:null},{max:95,rate:7.34,comp:null}] }
      ],
      lowDeposit:"November 2026 variable-rate increase of 0.25 percentage points has been applied to the previous tier rates as an indicative estimate. Product-specific new-customer discounts and comparison rates require confirmation from the lender. LMI and government guarantee eligibility must be confirmed separately."
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
      id:"ing", name:"ING", asOf:"13 Nov 2026 (announced +0.25pp; tier estimates)",
      products:[
        { id:"simplifier", name:"Mortgage Simplifier", annualFee:0, upfrontFee:350,
          blurb:"No monthly or annual fees, unlimited extra repayments and redraw. No offset. $150,000 minimum total borrowings; $350 settlement fee.",
          tiers:[{max:60,rate:6.54,comp:null},{max:70,rate:6.54,comp:null},{max:80,rate:6.59,comp:null},{max:90,rate:6.74,comp:null},{max:95,rate:7.19,comp:null}] }
      ],
      lowDeposit:"November 2026 variable-rate increase of 0.25 percentage points has been applied to the previous tier rates as an indicative estimate. Product-specific new-customer discounts and comparison rates require confirmation from the lender. LMI and government guarantee eligibility must be confirmed separately."
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
      id:"cba", name:"CommBank", asOf:"13 Nov 2026 (announced +0.25pp; tier estimates)",
      products:[
        { schemeLender:"cba", id:"digi", name:"Digi Home Loan", annualFee:0, upfrontFee:300,
          blurb:"Online only (no brokers), capped at 80% LVR. $300 establishment fee; no loan service fee or offset feature fee.",
          tiers:[{max:60,rate:6.59,comp:null},{max:70,rate:6.62,comp:null},{max:80,rate:6.64,comp:null}] },
        { schemeLender:"cba", id:"simple", name:"Simple Home Loan", annualFee:120, upfrontFee:300, feeNote:"$10/mo service fee",
          blurb:"Up to two offsets at no extra feature fee. $300 establishment fee and $10 monthly loan service fee from 1 October 2026.",
          tiers:[{max:60,rate:6.84,comp:null},{max:70,rate:6.89,comp:null},{max:80,rate:6.99,comp:null},{max:90,rate:7.29,comp:null},{max:95,rate:8.24,comp:null}] },
        { schemeLender:"cba", id:"svr", name:"Standard Variable + Wealth Package", annualFee:395, upfrontFee:0,
          blurb:"0.70% p.a. package discount already applied. Multiple offsets, splits, top-ups. $395 annual package fee.",
          tiers:[{max:60,rate:6.84,comp:null},{max:70,rate:6.89,comp:null},{max:80,rate:6.99,comp:null},{max:90,rate:7.29,comp:null},{max:95,rate:8.24,comp:null}] },
        { schemeLender:"cba", id:"fix2", name:"2-year Fixed + Wealth Package", annualFee:395, upfrontFee:0, fixed:true,
          blurb:"Fixed 2 years, then reverts to Standard Variable less the package discount. No offset while fixed.",
          tiers:[{max:95,rate:6.82,comp:8.38}] }
      ],
      lowDeposit:"November 2026 variable-rate increase of 0.25 percentage points has been applied to the previous tier rates as an indicative estimate. Product-specific new-customer discounts and comparison rates require confirmation from the lender. LMI and government guarantee eligibility must be confirmed separately."
    },
    {
      id:"anz", name:"ANZ", asOf:"13 Nov 2026 (announced +0.25pp; tier estimates)",
      products:[
        { schemeLender:"anz", id:"simplicity", name:"Simplicity PLUS", annualFee:0, upfrontFee:0,
          blurb:"No setup or ongoing fees, free redraw, no offset. Requires an eligible ANZ everyday or savings account. $50,000 minimum.",
          tiers:[{max:60,rate:6.89,comp:null},{max:70,rate:6.94,comp:null},{max:80,rate:7.04,comp:null},{max:90,rate:7.59,comp:null},{max:95,rate:8.14,comp:null}] }
      ],
      lowDeposit:"November 2026 variable-rate increase of 0.25 percentage points has been applied to the previous tier rates as an indicative estimate. Product-specific new-customer discounts and comparison rates require confirmation from the lender. LMI and government guarantee eligibility must be confirmed separately."
    },
    {
      id:"nab", name:"NAB", asOf:"13 Nov 2026 (announced +0.25pp; tier estimates)",
      products:[
        { schemeLender:"nab", id:"base", name:"Base Variable Rate", annualFee:0, upfrontFee:0,
          blurb:"No application or ongoing fees. One published rate, not tiered by LVR — unusual among the majors.",
          tiers:[{max:95,rate:6.94,comp:null}] },
        { schemeLender:"nab", id:"tailored", name:"Tailored Variable + offset", annualFee:0, upfrontFee:0, indicative:true,
          blurb:"Rate individually negotiated. Shown at the ceiling of NAB's current published range for 60–70% LVR — an upper bound, not a quote.",
          tiers:[{max:70,rate:7.29,comp:null}] }
      ],
      lowDeposit:"November 2026 variable-rate increase of 0.25 percentage points has been applied to the previous tier rates as an indicative estimate. Product-specific new-customer discounts and comparison rates require confirmation from the lender. LMI and government guarantee eligibility must be confirmed separately."
    }
  ];

  /* LMI: indicative full-doc premium, % of loan. Midpoints of published ranges. */
  var LMI_TABLE = [
    { lvrMax:85, bands:[[300000,0.601],[500000,0.769],[600000,1.035],[750000,1.119],[Infinity,1.160]] },
    { lvrMax:90, bands:[[300000,1.086],[500000,1.351],[600000,1.603],[750000,1.813],[Infinity,1.929]] },
    { lvrMax:95, bands:[[300000,2.311],[500000,2.982],[600000,3.756],[750000,4.198],[Infinity,4.212]] }
  ];

