"use strict";
  /* ============================================================
     RATE DATA — owner-occupier, principal & interest, new lending
     ============================================================ */
  var LENDERS = [
    {
      id:"westpac", name:"Westpac", asOf:"21 Sep 2026",
      products:[
        { id:"flexi", name:"Flexi First Option (Online Offer)", annualFee:0, upfrontFee:0,
          blurb:"Life-of-loan discount. Online applications only. No offset; excludes internal Westpac Group refinances.",
          tiers:[{max:70,rate:5.99,comp:6.00},{max:80,rate:6.09,comp:6.10},{max:95,rate:6.84,comp:6.85}] }
      ],
      lowDeposit:"Lends to 95% LVR, but the Flexi First rate jumps straight from 6.09% to 6.84% the moment you cross 80% — one step, no 85% or 90% landing. That remains one of the steepest 80% LVR cliffs in this comparison. Westpac is a participating lender for the Australian Government 5% Deposit Scheme, which removes LMI but not the rate step."
    },
    {
      id:"macquarie", name:"Macquarie", asOf:"8 Sep 2026",
      products:[
        { id:"basic", name:"Basic Home Loan", annualFee:0, upfrontFee:350,
          blurb:"No ongoing fees, free redraw, no offset. $350 documentation fee at settlement.",
          tiers:[{max:60,rate:6.04,comp:6.06},{max:70,rate:6.04,comp:6.06},{max:80,rate:6.09,comp:6.11},{max:90,rate:6.29,comp:6.31},{max:95,rate:7.09,comp:7.12}] },
        { id:"offset", name:"Offset Home Loan", annualFee:248, upfrontFee:350,
          blurb:"Same interest rate as Basic, plus up to 10 offset accounts for a $248 annual facility fee.",
          tiers:[{max:60,rate:6.04,comp:6.29},{max:70,rate:6.04,comp:6.29},{max:80,rate:6.09,comp:6.34},{max:90,rate:6.29,comp:6.54},{max:95,rate:7.09,comp:7.33}] },
        { id:"fix3", name:"3-year Fixed (Basic)", annualFee:0, upfrontFee:350, fixed:true,
          blurb:"Fixed for 3 years, then reverts to the variable rate then applying. Extra repayments capped at $10,000 a year.",
          tiers:[{max:70,rate:6.39,comp:6.16},{max:80,rate:6.44,comp:6.21},{max:95,rate:6.74,comp:7.01}] }
      ],
      lowDeposit:"Macquarie's Basic Home Loan moves from 6.09% at 80% to 6.29% at 90% — a 20 basis-point step — then jumps 80 bp to 7.09% in the 90–95% band. ING now also publishes a 20 bp 80-to-90% step and is slightly lower at 90% on the advertised rates used here. Macquarie is broker-originated for most files and is not a 5% Deposit Scheme participant."
    },
    {
      id:"ing", name:"ING", asOf:"22 Sep 2026",
      products:[
        { id:"simplifier", name:"Mortgage Simplifier", annualFee:0, upfrontFee:350,
          blurb:"No monthly or annual fees, unlimited extra repayments and redraw. No offset. $150,000 minimum total borrowings; $350 settlement fee.",
          tiers:[{max:60,rate:5.99,comp:6.02},{max:70,rate:5.99,comp:6.02},{max:80,rate:6.04,comp:6.07},{max:90,rate:6.24,comp:6.27},{max:95,rate:6.69,comp:6.72}] }
      ],
      lowDeposit:"Mortgage Simplifier is published through 95% LVR. The 80% rate of 6.04% becomes 6.24% in the 80.01–90% band (+20 bp), then 6.69% in the 90.01–95% band. LMI may still apply above 80% unless a waiver or government scheme applies. The advertised variable rates are for new property and new borrowings with ING."
    },
    {
      id:"me", name:"ME Bank", asOf:"11 Sep 2026",
      products:[
        { id:"econome", name:"EconoME Home Loan", annualFee:0, upfrontFee:150,
          blurb:"No annual fee, unlimited additional repayments on variable loans, redraw of extra repayments, and a $150 settlement fee. Advertised P&I rates below are for total borrowings of $150,000 or more.",
          tiers:[{max:60,rate:5.99,comp:6.01},{max:70,rate:5.99,comp:6.01},{max:80,rate:6.04,comp:6.06},{max:90,rate:6.34,comp:6.36},{max:95,rate:7.04,comp:7.06}] }
      ],
      lowDeposit:"EconoME publishes a 30 bp step from 6.04% at 80% LVR to 6.34% at 90%, then a larger 70 bp step to 7.04% in the 90.01–95% band. The product page states a maximum LVR of up to 95%. Rates are for new owner-occupier principal-and-interest lending and remain subject to ME's credit approval and valuation."
    },
    {
      id:"cba", name:"CommBank", asOf:"15 May 2026",
      products:[
        { id:"digi", name:"Digi Home Loan", annualFee:0, upfrontFee:0,
          blurb:"Lowest CBA variable, but online applications only (no brokers) and capped at 80% LVR. One offset for $10/month.",
          tiers:[{max:60,rate:6.09,comp:6.22},{max:70,rate:6.12,comp:6.25},{max:80,rate:6.14,comp:6.27}] },
        { id:"simple", name:"Simple Home Loan", annualFee:240, upfrontFee:300, feeNote:"$20/mo service fee",
          blurb:"Up to two offsets for $10/month. $300 establishment fee and $20 a month in loan service fees.",
          tiers:[{max:60,rate:6.34,comp:6.59},{max:70,rate:6.39,comp:6.64},{max:80,rate:6.49,comp:6.74},{max:90,rate:6.79,comp:7.04},{max:95,rate:7.74,comp:7.98}] },
        { id:"svr", name:"Standard Variable + Wealth Package", annualFee:395, upfrontFee:0,
          blurb:"0.70% p.a. package discount already applied. Multiple offsets, splits, top-ups. $395 annual package fee.",
          tiers:[{max:60,rate:6.34,comp:6.72},{max:70,rate:6.39,comp:6.77},{max:80,rate:6.49,comp:6.87},{max:90,rate:6.79,comp:7.16},{max:95,rate:7.74,comp:8.10}] },
        { id:"fix2", name:"2-year Fixed + Wealth Package", annualFee:395, upfrontFee:0, fixed:true,
          blurb:"Fixed 2 years, then reverts to Standard Variable less the package discount. No offset while fixed.",
          tiers:[{max:95,rate:6.34,comp:8.09}] }
      ],
      lowDeposit:"Two things happen at once below a 20% deposit. The Digi Home Loan — CBA's sharpest rate — disappears entirely, because it is capped at 80% LVR, so you fall back to Simple or Standard Variable. Then the tier itself steps: 6.49% at 80% becomes 6.79% at 90%, and 7.74% in the 90–95% band, 125 bp above the 80% tier. CBA is a participating 5% Deposit Scheme lender and advertises five low-deposit pathways including guarantor support."
    },
    {
      id:"anz", name:"ANZ", asOf:"15 May 2026",
      products:[
        { id:"simplicity", name:"Simplicity PLUS", annualFee:0, upfrontFee:0,
          blurb:"No setup or ongoing fees, free redraw, no offset. Requires an eligible ANZ everyday or savings account. $50,000 minimum.",
          tiers:[{max:60,rate:6.39,comp:6.39},{max:70,rate:6.44,comp:6.44},{max:80,rate:6.54,comp:6.54},{max:90,rate:7.09,comp:7.09}] }
      ],
      lowDeposit:"Simplicity PLUS steps 55 bp at the 80% line — 6.54% to 7.09% — and ANZ publishes no tier above 90%, so a deposit under 10% needs a different ANZ product. ANZ's Standard Variable is priced by negotiation with separate discount margins above and below 80% LVR, so it is not modelled here. Worth asking about separately: a $3,000 cashback for eligible first home buyers borrowing $250,000 or more, and an LMI waiver for eligible professionals, which can be worth more than any rate difference on this page."
    },
    {
      id:"nab", name:"NAB", asOf:"21 Sep 2026",
      products:[
        { id:"base", name:"Base Variable Rate", annualFee:0, upfrontFee:0,
          blurb:"No application or ongoing fees. One published rate, not tiered by LVR — unusual among the majors.",
          tiers:[{max:95,rate:6.44,comp:6.44}] },
        { id:"tailored", name:"Tailored Variable + offset", annualFee:0, upfrontFee:0, indicative:true,
          blurb:"Rate individually negotiated. Shown at the ceiling of NAB's published range for a 30%+ deposit — an upper bound, not a quote.",
          tiers:[{max:70,rate:6.79,comp:6.92}] }
      ],
      lowDeposit:"NAB is the outlier: the Base Variable Rate is a single published rate with no LVR tiering at all, so crossing 80% leaves your interest rate unchanged — only LMI applies. NAB lends to 95% LVR on owner-occupier principal-and-interest. The trade-off is that 6.44% is the highest starting point of these seven published comparisons, so NAB wins on a small deposit and loses on a large one. NAB has quoted Tailored rates from around 6.09% at 60% LVR in third-party comparisons, but that is negotiated pricing, not a published tier."
    }
  ];

  /* LMI: indicative full-doc premium, % of loan. Midpoints of published ranges. */
  var LMI_TABLE = [
    { lvrMax:85, bands:[[300000,0.601],[500000,0.769],[600000,1.035],[750000,1.119],[Infinity,1.160]] },
    { lvrMax:90, bands:[[300000,1.086],[500000,1.351],[600000,1.603],[750000,1.813],[Infinity,1.929]] },
    { lvrMax:95, bands:[[300000,2.311],[500000,2.982],[600000,3.756],[750000,4.198],[Infinity,4.212]] }
  ];

