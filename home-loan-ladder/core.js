"use strict";
  /* ---------- helpers ---------- */
  var $ = function(id){ return document.getElementById(id); };
  var nf0 = new Intl.NumberFormat('en-AU',{maximumFractionDigits:0});
  function fmtMoney(n){ return '$' + nf0.format(Math.max(0,Math.round(n))); }
  var money = fmtMoney;
  function pct(n){ return n.toFixed(2) + '%'; }
  function num(id){ var v = parseFloat($(id).value); return isFinite(v) ? v : 0; }

  function repayment(principal, annualRate, years, perYear){
    if(principal<=0) return 0;
    var r = annualRate/100/perYear, n = years*perYear;
    if(r<=0) return principal/n;
    return principal * r / (1 - Math.pow(1+r,-n));
  }
  function maxPrincipal(payment, annualRate, years, perYear){
    if(payment<=0) return 0;
    var r = annualRate/100/perYear, n = years*perYear;
    if(r<=0) return payment*n;
    return payment * (1 - Math.pow(1+r,-n)) / r;
  }
  function interestOver(loan, rate, years, months){
    if(loan<=0) return 0;
    var r = rate/100/12, n = years*12, pay = repayment(loan, rate, years, 12);
    var bal = loan, total = 0, m = Math.min(months, n);
    for(var i=0;i<m;i++){
      var int = bal*r;
      total += int;
      bal -= (pay - int);
      if(bal<0) bal=0;
    }
    return total;
  }
  function tierFor(product, lvr){
    for(var i=0;i<product.tiers.length;i++) if(lvr <= product.tiers[i].max + 1e-9) return product.tiers[i];
    return null;
  }
  function productMaxLvr(p){ return p.tiers[p.tiers.length-1].max; }
  function lmiPct(lvr, loan){
    if(lvr<=80) return 0;
    for(var i=0;i<LMI_TABLE.length;i++){
      if(lvr <= LMI_TABLE[i].lvrMax + 1e-9){
        var b = LMI_TABLE[i].bands;
        for(var j=0;j<b.length;j++) if(loan <= b[j][0]) return b[j][1];
      }
    }
    return 4.212;
  }
  function hemFloor(hasPartner, deps){ return (hasPartner ? 3100 : 2100) + deps*520; }
  function freqLabel(p){ return p===12 ? 'monthly' : p===26 ? 'fortnightly' : 'weekly'; }
  function freqNoun(p){ return p===12 ? 'month' : p===26 ? 'fortnight' : 'week'; }

  function stampDuty(state, value, isFhb){
    var D = DUTY[state];
    var base = D.base(value);
    if(!isFhb) return { duty:base, base:base, exact:true, note:D.note, concessionName:D.concessionName };
    var r = D.fhb(value, base);
    return { duty:r.duty, base:base, exact:r.exact, note:r.note, fhbNote:r.note, concessionName:D.concessionName, baseNote:D.note };
  }

  /* ---------- state ---------- */
  var selectedLender = 'macquarie';
  var selectedProduct = null;
  var horizon = '5';
  var cashMode = 'savings';
  var syncing = false;

  function readState(){
    var price = Math.max(1, num('price'));
    var stateCode = $('state').value;
    var isFhb = $('fhb').checked;
    var duty = stampDuty(stateCode, price, isFhb);
    var otherCosts = num('otherCosts');
    var cash = num('cash');
    var capLmi = $('capLmi').checked;
    var scheme = $('scheme').checked;

    var deposit, savings;
    if(cashMode==='deposit'){
      deposit = Math.min(cash, price);
      savings = deposit + duty.duty + otherCosts;
      if(!capLmi && !scheme){
        var lv = ((price-deposit)/price)*100;
        savings += (price-deposit) * lmiPct(lv, price-deposit)/100;
      }
    } else {
      savings = cash;
      /* fixed-point: LMI depends on deposit, deposit depends on LMI */
      deposit = Math.max(0, savings - duty.duty - otherCosts);
      for(var i=0;i<8;i++){
        var loan = Math.max(0, price - deposit);
        var lvr = price>0 ? (loan/price)*100 : 0;
        var lmiCash = (capLmi || scheme) ? 0 : loan * lmiPct(lvr, loan)/100;
        var next = Math.max(0, Math.min(price, savings - duty.duty - otherCosts - lmiCash));
        if(Math.abs(next-deposit) < 1) { deposit = next; break; }
        deposit = next;
      }
    }

    var baseLoan = Math.max(0, price - deposit);
    var lvr = price>0 ? (baseLoan/price)*100 : 0;
    var inc2 = num('inc2'), deps = num('deps');
    var declaredExp = num('expenses');
    var floor = hemFloor(inc2>0, deps);

    return {
      price:price, stateCode:stateCode, duty:duty, otherCosts:otherCosts,
      cash:cash, savings:savings, deposit:deposit, baseLoan:baseLoan, lvr:lvr,
      isFhb:isFhb, term:Math.max(1,num('term')), perYear:parseInt($('freq').value,10),
      inc1:num('inc1'), inc2:inc2, incOther:num('incOther'), deps:deps,
      declaredExp:declaredExp, hem:floor, usedExp:Math.max(declaredExp, floor),
      otherDebt:num('otherDebt'), cardLimit:num('cardLimit'),
      buffer:num('buffer'), floorRate:num('floorRate'),
      capLmi:capLmi, scheme:scheme
    };
  }

  function evaluate(product, s){
    var t = tierFor(product, s.lvr);
    if(!t) return { available:false, maxLvr:productMaxLvr(product) };
    var lmiRate = s.scheme ? 0 : lmiPct(s.lvr, s.baseLoan);
    var lmi = s.baseLoan * lmiRate/100;
    var loan = s.baseLoan + (s.capLmi ? lmi : 0);
    var t80 = tierFor(product, 80);
    var annual = product.annualFee||0, upfront = product.upfrontFee||0;
    var i5 = interestOver(loan, t.rate, s.term, 60);
    var iFull = interestOver(loan, t.rate, s.term, s.term*12);
    return {
      available:true, tier:t, rate:t.rate, comp:t.comp,
      lmi:lmi, lmiRate:lmiRate, loan:loan,
      payment: repayment(loan, t.rate, s.term, s.perYear),
      stepBp: (t80 && s.lvr>80) ? Math.round((t.rate - t80.rate)*100) : 0,
      rate80: t80 ? t80.rate : null,
      maxLvr: productMaxLvr(product),
      annualFee:annual, upfrontFee:upfront,
      cost5:  i5   + annual*5        + upfront + lmi,
      costFull:iFull + annual*s.term + upfront + lmi
    };
  }
  function cheapestProduct(lender, s, key){
    var best=null, bestEv=null;
    for(var i=0;i<lender.products.length;i++){
      var e = evaluate(lender.products[i], s);
      if(!e.available) continue;
      var metric = key==='rate' ? e.rate : e[key];
      var bestMetric = bestEv ? (key==='rate' ? bestEv.rate : bestEv[key]) : Infinity;
      if(metric < bestMetric - 1e-9){ best=lender.products[i]; bestEv=e; }
    }
    return best ? {product:best, ev:bestEv} : null;
  }

  function serviceability(rate, s){
    var assess = Math.max(rate + s.buffer, s.floorRate);
    function netAnnual(g){
      if(g<=0) return 0;
      var t = g<=18200 ? 0
        : g<=45000 ? (g-18200)*0.15
        : g<=135000 ? 4020+(g-45000)*0.30
        : g<=190000 ? 31020+(g-135000)*0.37
        : 51370+(g-190000)*0.45;
      var m = g<=27222 ? 0 : (g<34027 ? (g-27222)*0.10 : g*0.02);
      return g - t - m;
    }
    var netIncome = netAnnual(s.inc1 + s.incOther) + netAnnual(s.inc2);
    var netMonthly = netIncome/12;
    var cardMonthly = s.cardLimit * 0.038;
    var surplus = netMonthly - s.usedExp - s.otherDebt - cardMonthly;
    return { assess:assess, netIncome:netIncome, netMonthly:netMonthly, cardMonthly:cardMonthly,
             surplus:surplus, maxLoan:maxPrincipal(Math.max(0,surplus), assess, s.term, 12) };
  }

