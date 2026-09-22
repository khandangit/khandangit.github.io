"use strict";
  /* ============================================================
     STAMP DUTY — owner-occupier. Base scales verified against an
     independent comparison at $500k / $800k / $1m in all eight.
     ============================================================ */
  function per100(x){ return Math.ceil(x/100); }   /* "each $100 or part of $100" */

  var DUTY = {
    QLD:{
      label:"Queensland", concessionName:"home concession",
      base:function(v){
        if(v<=350000) return per100(v)*1.00;
        if(v<=540000) return 3500 + per100(v-350000)*3.50;
        if(v<=1000000) return 10150 + per100(v-540000)*4.50;
        return 30850 + per100(v-1000000)*5.75;
      },
      fhb:function(v, base){
        var t=[15615,13880,12145,10410,8675,6940,5205,3470,1735], c=0;
        if(v<710000) c=17350;
        else if(v<800000) c = t[Math.min(t.length-1, Math.floor((v-710000)/10000))];
        return { duty:Math.max(0, base-c), exact:true,
          note: c>0 ? "First home concession of " + fmtMoney(c) + " applied on top of the home concession, from the published Queensland Revenue Office table."
                    : "Above $800,000 the Queensland first home concession is nil, so only the home concession applies." };
      },
      note:"The owner-occupier home concession is applied automatically — it assumes you move in within a year and live there for a year. Queensland also has a separate first home (new home) concession for newly built homes that is not modelled here."
    },
    NSW:{
      label:"New South Wales", concessionName:null,
      base:function(v){
        if(v<=18000) return Math.max(20, per100(v)*1.25);
        if(v<=38000) return 225 + per100(v-18000)*1.50;
        if(v<=103000) return 525 + per100(v-38000)*1.75;
        if(v<=387000) return 1662 + per100(v-103000)*3.50;
        if(v<=1290000) return 11602 + per100(v-387000)*4.50;
        if(v<=3870000) return 52237 + per100(v-1290000)*5.50;
        return 194137 + per100(v-3870000)*7.00;
      },
      fhb:function(v, base){
        if(v<=800000) return { duty:0, exact:true, note:"Full exemption under the First Home Buyers Assistance Scheme, which covers new and existing homes to $800,000." };
        if(v<1000000) return { duty:base*(v-800000)/200000, exact:false, note:"Between $800,000 and $1,000,000 the scheme tapers. This is a straight-line taper of the full duty — an approximation; use the Revenue NSW first home buyer calculator for the exact figure." };
        return { duty:base, exact:true, note:"Above $1,000,000 no first home concession applies in NSW." };
      },
      note:"NSW has no separate owner-occupier concession — the standard scale applies to everyone. A premium rate applies above $3,870,000 for residential property."
    },
    VIC:{
      label:"Victoria", concessionName:"principal place of residence scale",
      base:function(v){
        if(v<=25000) return v*0.014;
        if(v<=130000) return 350 + (v-25000)*0.024;
        if(v<=440000) return 2870 + (v-130000)*0.05;      /* PPR */
        if(v<=550000) return 18370 + (v-440000)*0.06;     /* PPR */
        if(v<=960000) return 2870 + (v-130000)*0.06;      /* general */
        if(v<=2000000) return v*0.055;
        return 110000 + (v-2000000)*0.065;
      },
      fhb:function(v, base){
        if(v<=600000) return { duty:0, exact:true, note:"Full exemption for first home buyers to $600,000." };
        if(v<=750000) return { duty:base*(v-600000)/150000, exact:false, note:"Between $600,000 and $750,000 the concession slides. This is a straight-line taper — an approximation; the State Revenue Office calculator gives the exact figure." };
        return { duty:base, exact:true, note:"Above $750,000 no first home concession applies in Victoria." };
      },
      note:"The principal-place-of-residence scale is applied automatically where it helps — it only bites below $550,000. Above $960,000 Victoria charges a flat 5.5% of the whole value, which is why duty jumps at that threshold."
    },
    SA:{
      label:"South Australia", concessionName:null,
      base:function(v){
        if(v<=12000) return v*0.01;
        if(v<=30000) return 120 + (v-12000)*0.02;
        if(v<=50000) return 480 + (v-30000)*0.03;
        if(v<=100000) return 1080 + (v-50000)*0.035;
        if(v<=200000) return 2830 + (v-100000)*0.04;
        if(v<=250000) return 6830 + (v-200000)*0.0425;
        if(v<=300000) return 8955 + (v-250000)*0.0475;
        if(v<=500000) return 11330 + (v-300000)*0.05;
        return 21330 + (v-500000)*0.055;
      },
      fhb:function(v, base){
        return { duty:0, exact:false, note:"South Australia abolished duty for first home buyers on NEW homes and vacant land from 6 June 2024, with no price cap — shown as nil here. An established home gets no concession, so untick the first home buyer box if you are buying existing stock." };
      },
      note:"South Australia has no general owner-occupier concession — the standard scale applies."
    },
    WA:{
      label:"Western Australia", concessionName:null,
      base:function(v){
        if(v<=120000) return v*0.019;
        if(v<=150000) return 2280 + (v-120000)*0.0285;
        if(v<=360000) return 3135 + (v-150000)*0.038;
        if(v<=725000) return 11115 + (v-360000)*0.0475;
        return 28453 + (v-725000)*0.0515;
      },
      fhb:function(v, base){
        if(v<=500000) return { duty:0, exact:true, note:"Full exemption under the First Home Owner Rate of duty to $500,000." };
        if(v<=700000) return { duty:per100(v-500000)*13.63, exact:true, note:"Perth and Peel concessional rate: $13.63 per $100 above $500,000. Regional WA uses $11.89 per $100 to $750,000 — not modelled here, so a regional purchase will be cheaper than shown." };
        return { duty:base, exact:true, note:"Above $700,000 the metropolitan first home owner rate ends and the general scale applies. Regional Western Australia extends to $750,000." };
      },
      note:"Western Australia's separate residential rate only applies below $200,000, so the general scale is used here."
    },
    TAS:{
      label:"Tasmania", concessionName:null,
      base:function(v){
        if(v<=3000) return 50;
        if(v<=25000) return 50 + per100(v-3000)*1.75;
        if(v<=75000) return 435 + per100(v-25000)*2.25;
        if(v<=200000) return 1560 + per100(v-75000)*3.50;
        if(v<=375000) return 5935 + per100(v-200000)*4.00;
        if(v<=725000) return 12935 + per100(v-375000)*4.25;
        return 27810 + per100(v-725000)*4.50;
      },
      fhb:function(v, base){
        if(v<750000) return { duty:0, exact:false, note:"Tasmania's full first home buyer exemption below $750,000 was legislated to run to 30 June 2026 and was then to be reviewed. That date has passed — confirm with the State Revenue Office whether it still applies before relying on a nil figure." };
        return { duty:base, exact:true, note:"Above $750,000 no first home exemption applied under the scheme as legislated." };
      },
      note:"Tasmania has no separate owner-occupier concession — the standard scale applies."
    },
    ACT:{
      label:"Australian Capital Territory", concessionName:"eligible owner-occupier scale",
      base:function(v){
        if(v<=260000) return per100(v)*0.28;
        if(v<=300000) return 728 + per100(v-260000)*2.20;
        if(v<=500000) return 1608 + per100(v-300000)*3.40;
        if(v<=750000) return 8408 + per100(v-500000)*4.32;
        if(v<=1000000) return 19208 + per100(v-750000)*5.90;
        if(v<=1455000) return 33958 + per100(v-1000000)*6.40;
        return v*0.0454;
      },
      fhb:function(v, base){
        if(v<=1020000) return { duty:0, exact:true, note:"Full exemption under the ACT Home Buyer Concession Scheme, which is income-tested — household income must sit under the scheme threshold, so confirm eligibility before assuming nil." };
        return { duty:base, exact:true, note:"Above $1,020,000 the Home Buyer Concession Scheme does not apply." };
      },
      note:"The eligible owner-occupier scale is applied — roughly $2,992 below the investor scale across the mid bands. The ACT also charges annual land tax in place of some duty, which is not modelled."
    },
    NT:{
      label:"Northern Territory", concessionName:null,
      base:function(v){
        if(v<525000){ var V=v/1000; return 0.06571441*V*V + 15*V; }
        if(v<3000000) return v*0.0495;
        if(v<5000000) return v*0.0575;
        return v*0.0595;
      },
      fhb:function(v, base){
        return { duty:base, exact:false, note:"The Northern Territory offers a first home concession on properties to $650,000, but its structure is not published in a form this tool can reproduce, so no reduction is applied. Treat the figure shown as an upper bound and check with the Territory Revenue Office." };
      },
      note:"Below $525,000 the Territory uses a quadratic formula rather than a bracket table; above it, a flat percentage of the whole value."
    }
  };
