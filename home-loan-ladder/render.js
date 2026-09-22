"use strict";
  /* ============================================================ RENDER */
  function render(){
    var s = readState();
    $('lvrTag').textContent = 'LVR ' + s.lvr.toFixed(1) + '%';
    $('cashLabel').textContent = cashMode==='savings' ? 'Total savings' : 'Deposit only';
    $('cashHint').textContent = cashMode==='savings'
      ? 'after ' + money(s.duty.duty + s.otherCosts) + ' of duty and costs, your deposit is ' + money(s.deposit)
        + ' — ' + (100-s.lvr).toFixed(1) + '% of the price'
      : 'you will also need ' + money(s.savings - s.deposit) + ' for duty and costs — '
        + money(s.savings) + ' in total';
    $('hemHint').textContent = 'expense floor: ' + money(s.hem) + '/mo';
    $('dutyTag').textContent = DUTY[s.stateCode].label + (s.isFhb ? ' · first home buyer' : '');

    renderLenders(s);
    renderSelected(s);
    renderComparison(s);
  }

  function renderLenders(s){
    var host = $('lenderList');
    host.innerHTML = '';

    var ranked = LENDERS.map(function(L){
      return { lender:L, pick:cheapestProduct(L, s, 'rate') };
    }).sort(function(a,b){
      if(a.pick && b.pick) return a.pick.ev.rate - b.pick.ev.rate || a.pick.ev.comp - b.pick.ev.comp || a.lender.name.localeCompare(b.lender.name);
      if(a.pick) return -1;
      if(b.pick) return 1;
      return a.lender.name.localeCompare(b.lender.name);
    });

    var availableRank = 0;
    ranked.forEach(function(item){
      var L = item.lender, pick = item.pick;
      if(pick) availableRank += 1;

      var btn = document.createElement('button');
      btn.type='button';
      var rankClass = !pick ? ' na' : (availableRank===1 ? ' rank-1' : availableRank===2 ? ' rank-2' : ' rank-rest');
      btn.className = 'lender' + rankClass;
      btn.setAttribute('aria-pressed', L.id===selectedLender ? 'true' : 'false');
      btn.innerHTML = '<span class="lname"></span><span class="lrate"></span><span class="lmeta"></span>';
      btn.querySelector('.lname').textContent = L.name;
      btn.querySelector('.lrate').textContent = pick ? pct(pick.ev.rate) : 'n/a';

      var rankLabel = pick ? (availableRank===1 ? 'LOWEST · ' : availableRank===2 ? '2ND LOWEST · ' : '') : '';
      btn.querySelector('.lmeta').textContent = pick
        ? rankLabel + 'comp ' + pct(pick.ev.comp) + ' · ' + pick.product.name + (pick.product.fixed ? ' [fixed]' : '')
        : 'no published tier at ' + s.lvr.toFixed(0) + '% LVR';

      btn.addEventListener('click', function(){ selectedLender = L.id; selectedProduct = null; render(); });
      host.appendChild(btn);
    });
  }

  function currentLender(){
    for(var i=0;i<LENDERS.length;i++) if(LENDERS[i].id===selectedLender) return LENDERS[i];
    return LENDERS[0];
  }

  function renderSelected(s){
    var L = currentLender();
    $('selHd').textContent = L.name;
    $('selAsOf').textContent = 'Published ' + L.asOf;

    var sel = $('product'), keep = selectedProduct;
    sel.innerHTML = '';
    L.products.forEach(function(p){
      var o = document.createElement('option'), e = evaluate(p, s);
      o.value = p.id;
      o.textContent = p.name + (e.available ? '  —  ' + pct(e.rate) : '  —  n/a at ' + s.lvr.toFixed(0) + '% LVR');
      sel.appendChild(o);
    });
    if(!L.products.some(function(p){ return p.id===keep; })){
      var pk = cheapestProduct(L, s, 'rate');
      keep = pk ? pk.product.id : L.products[0].id;
    }
    sel.value = keep; selectedProduct = keep;
    var P = L.products.filter(function(p){ return p.id===keep; })[0];
    $('productBlurb').textContent = P.blurb;

    var ev = evaluate(P, s);

    /* ---- ladder ---- */
    $('ladderHd').textContent = (P.fixed ? 'Fixed rate' : 'Variable rate') + ' by LVR tier — highlighted row is yours at '
      + s.lvr.toFixed(1) + '% LVR';
    var ladder = $('ladder'); ladder.innerHTML = '';
    var rates = P.tiers.map(function(t){ return t.rate; });
    var lo = Math.min.apply(null, rates), hi = Math.max.apply(null, rates), span = Math.max(0.01, hi-lo);
    var cliffDrawn = false;
    P.tiers.forEach(function(t, idx){
      var prev = idx>0 ? P.tiers[idx-1].max : 0;
      if(!cliffDrawn && t.max > 80 && prev <= 80){
        var c = document.createElement('div'); c.className='cliff';
        c.innerHTML = '<span>80% LVR — LMI territory below</span>';
        ladder.appendChild(c); cliffDrawn = true;
      }
      var active = (s.lvr <= t.max + 1e-9) && (idx===0 || s.lvr > prev);
      var row = document.createElement('div');
      row.className = 'rung' + (active ? ' active' : '');
      row.innerHTML = '<span class="tier"></span><span class="bar"><i style="width:'
        + (22 + 78*((t.rate-lo)/span)).toFixed(1) + '%"></i></span><span class="rate"></span><span class="comp"></span>';
      row.querySelector('.tier').textContent = idx===0 ? '≤'+t.max+'%' : prev+'–'+t.max+'%';
      row.querySelector('.rate').textContent = pct(t.rate);
      row.querySelector('.comp').textContent = 'comp ' + pct(t.comp);
      ladder.appendChild(row);
    });
    if(productMaxLvr(P) < 95){
      var d = document.createElement('div'); d.className='rung dead';
      d.innerHTML = '<span class="tier">&gt;'+productMaxLvr(P)+'%</span><span class="bar"></span>'
        + '<span class="rate">—</span><span class="comp">not offered</span>';
      ladder.appendChild(d);
    }

    /* ---- low deposit ---- */
    var html = '';
    if(s.lvr > 80){
      html += '<div class="callout"><h3>Below a 20% deposit · ' + L.name + '</h3>';
      if(ev.available){
        if(ev.stepBp > 0){
          html += '<p><span class="big">+' + ev.stepBp + ' bp</span>on this product versus the same product at an 80% LVR ('
               + pct(ev.rate80) + ' → ' + pct(ev.rate) + '). On ' + money(s.baseLoan) + ' that is about '
               + money(repayment(s.baseLoan, ev.rate, s.term, 12) - repayment(s.baseLoan, ev.rate80, s.term, 12))
               + ' a month, for the life of the loan unless you refinance or revalue below 80%.</p>';
        } else {
          html += '<p><span class="big">No rate step</span>' + L.name + ' does not tier this product by LVR, so crossing 80% leaves your interest rate unchanged. LMI still applies.</p>';
        }
      }
      if(s.scheme){
        html += '<p><strong>LMI waived</strong> under the 5% Deposit Scheme. Queensland caps: $1,000,000 for Brisbane, Gold Coast and Sunshine Coast; $700,000 elsewhere in the state. Income caps were removed on 1 October 2025. Of these six, CommBank and Westpac participate; Macquarie and ING do not.</p>';
      } else if(ev.available){
        html += '<p><strong>LMI, estimated:</strong> ' + money(ev.lmi) + ' — about ' + ev.lmiRate.toFixed(2)
             + '% of the ' + money(s.baseLoan) + ' borrowed. '
             + (s.capLmi ? 'Capitalised, so you are repaying ' + money(ev.loan) + '.' : 'Payable at settlement, on top of deposit and duty.') + '</p>';
      }
      html += '<p>' + L.lowDeposit + '</p></div>';
    } else {
      html = '<div class="callout good"><h3>At or above a 20% deposit</h3><p>No LMI, and you sit in ' + L.name
           + "'s published pricing tiers. " + (s.lvr<=70
             ? 'You have also cleared the 70% line, where most of these lenders put their sharpest tier.'
             : 'Dropping to a 70% LVR would take about ' + money((s.lvr-70)/100*s.price) + ' more deposit and, on most of these products, another 5–10 basis points off the rate.')
           + '</p></div>';
    }
    $('lowDepositBox').innerHTML = html;

    /* ---- verdict ---- */
    var v = $('verdict'); v.innerHTML = '';
    function cell(label, value, sub, accent){
      var d = document.createElement('div'); d.className='vcell';
      d.innerHTML = '<div class="vlabel"></div><div class="vnum' + (accent?' accent':'') + '"></div>' + (sub?'<div class="vsub"></div>':'');
      d.querySelector('.vlabel').textContent = label;
      d.querySelector('.vnum').textContent = value;
      if(sub) d.querySelector('.vsub').textContent = sub;
      v.appendChild(d);
    }
    var cashNeeded = s.deposit + s.duty.duty + s.otherCosts + (ev.available ? ev.upfrontFee : 0)
                   + ((s.lvr>80 && !s.scheme && !s.capLmi && ev.available) ? ev.lmi : 0);
    if(ev.available){
      cell('Your rate', pct(ev.rate), (P.fixed ? 'fixed' : 'variable') + ' · comp ' + pct(ev.comp)
        + ' · ' + (s.lvr<=80 ? '≤' : '') + ev.tier.max + '% tier', true);
      cell('Repayment', money(ev.payment), freqLabel(s.perYear) + ' · ' + s.term + ' yrs' + (P.fixed ? ' · fixed' : ''));
      cell('Amount borrowed', money(ev.loan), s.lvr>80 && !s.scheme && s.capLmi ? 'incl. ' + money(ev.lmi) + ' LMI' : 'LVR ' + s.lvr.toFixed(1) + '%');
      cell('Stamp duty', money(s.duty.duty), DUTY[s.stateCode].label + (s.isFhb && s.duty.duty < s.duty.base ? ' · concession applied' : ''));
      cell('Cash to settle', money(cashNeeded), 'deposit + duty + costs');
    } else {
      cell('Your rate', 'n/a', 'above the ' + ev.maxLvr + '% LVR ceiling');
      cell('Repayment', '—', 'pick another product');
      cell('Amount borrowed', money(s.baseLoan), 'LVR ' + s.lvr.toFixed(1) + '%');
      cell('Stamp duty', money(s.duty.duty), DUTY[s.stateCode].label);
      cell('Cash to settle', money(cashNeeded), 'deposit + duty + costs');
    }

    renderLedger(P, ev, s);
    renderService(P, ev, s);
    renderCliffProse(L, P, ev, s);
  }

  function renderLedger(P, ev, s){
    var host = $('ledger'); host.innerHTML = '';
    function row(label, value, cls){
      var d = document.createElement('div');
      d.className = 'lrow' + (cls ? ' ' + cls : '');
      d.innerHTML = '<span></span><span></span>';
      d.children[0].textContent = label;
      d.children[1].textContent = value;
      host.appendChild(d);
    }
    row('Deposit into the purchase', money(s.deposit));
    var dutyLabel = 'Stamp duty — ' + DUTY[s.stateCode].label;
    row(dutyLabel, money(s.duty.duty));
    if(s.isFhb && s.duty.duty < s.duty.base - 1){
      row('└ saved against the full scale of ' + money(s.duty.base), '−' + money(s.duty.base - s.duty.duty), 'sub');
    }
    row('Conveyancing, searches, registration', money(s.otherCosts));
    if(ev.available && ev.upfrontFee>0) row(P.name + ' — upfront lender fee', money(ev.upfrontFee));
    if(s.lvr>80 && !s.scheme && ev.available){
      if(s.capLmi) row('LMI — capitalised into the loan, not paid now', money(0), 'sub');
      else row('Lenders mortgage insurance', money(ev.lmi));
    }
    var total = s.deposit + s.duty.duty + s.otherCosts + (ev.available ? ev.upfrontFee : 0)
              + ((s.lvr>80 && !s.scheme && !s.capLmi && ev.available) ? ev.lmi : 0);
    row('Cash required at settlement', money(total), 'total');

    var note = $('dutyNote');
    var bits = [];
    bits.push('<p>' + DUTY[s.stateCode].note + '</p>');
    if(s.isFhb){
      bits.push('<p><strong>' + (s.duty.exact ? 'First home concession applied.' : 'First home concession — approximate.') + '</strong> ' + s.duty.fhbNote + '</p>');
    }
    if(cashMode==='savings'){
      bits.push('<p>You are entering <strong>total savings</strong>, so duty and costs come out first and the remainder becomes the deposit — which is why the LVR moves when you change state or tick the first home buyer box. Switch the toggle to <strong>Deposit only</strong> if you would rather fix the deposit and see duty added on top.</p>');
    } else {
      bits.push('<p>You are entering a <strong>deposit</strong>, so duty and costs are added on top and the LVR stays fixed as you change state. Switch to <strong>Total savings</strong> to see what a fixed pot of cash actually buys after duty.</p>');
    }
    note.innerHTML = bits.join('');
  }

  function renderService(P, ev, s){
    var rate = ev.available ? ev.rate : 6.50;
    var sv = serviceability(rate, s);
    $('assessTag').textContent = 'Assessed at ' + pct(sv.assess);
    var need = ev.available ? ev.loan : s.baseLoan;
    var gap = sv.maxLoan - need;
    var cls, pill, msg;
    if(sv.surplus <= 0){
      cls='callout'; pill='<span class="pill bad">No surplus</span>';
      msg = 'Declared expenses and commitments consume the whole net income, so no loan services on these assumptions. Check the expense figure — it should exclude rent you will stop paying and the new mortgage itself.';
    } else if(gap >= 0){
      cls='callout good'; pill='<span class="pill ok">Services</span>';
      var ceiling = Math.min(s.deposit + sv.maxLoan, s.deposit/(1 - Math.min(0.95, productMaxLvr(P)/100)));
      msg = 'On these assumptions you clear the requirement with <strong>' + money(gap) + '</strong> of headroom. Maximum borrowing is <strong>'
          + money(sv.maxLoan) + '</strong>, which with a ' + money(s.deposit) + ' deposit supports a property up to about <strong>'
          + money(ceiling) + '</strong> — before the extra stamp duty that a dearer property would attract.';
    } else {
      cls='callout'; pill='<span class="pill warn">Short</span>';
      msg = 'You are <strong>' + money(-gap) + '</strong> short. Maximum borrowing is <strong>' + money(sv.maxLoan)
          + '</strong> against the ' + money(need) + ' this purchase needs — which points to a larger deposit, a cheaper property, or clearing the credit card limit.';
    }
    $('serviceBox').innerHTML = '<div class="' + cls + '"><h3>Serviceability ' + pill + '</h3><p>' + msg + '</p></div>';

    var dl = $('serviceDetail'); dl.innerHTML = '';
    function def(k,v){
      var d = document.createElement('div');
      d.innerHTML = '<dt></dt><dd></dd>';
      d.querySelector('dt').textContent = k;
      d.querySelector('dd').innerHTML = v;
      dl.appendChild(d);
    }
    def('Net income', '<b>' + money(sv.netMonthly) + '</b> / month, after 2026–27 income tax and Medicare levy on ' + money(s.inc1+s.inc2+s.incOther) + ' gross');
    def('Expenses used', '<b>' + money(s.usedExp) + '</b> / month' + (s.usedExp > s.declaredExp ? ' — the ' + money(s.hem) + ' benchmark floor, not your declared ' + money(s.declaredExp) : ' — as declared'));
    def('Commitments', '<b>' + money(s.otherDebt + sv.cardMonthly) + '</b> / month' + (s.cardLimit>0 ? ', including ' + money(sv.cardMonthly) + ' for a ' + money(s.cardLimit) + ' card limit assessed at 3.8%' : ''));
    def('Surplus', '<b>' + money(sv.surplus) + '</b> / month available for the mortgage');
    def('Assessment rate', '<b>' + pct(sv.assess) + '</b> — the ' + pct(rate) + ' product rate plus a ' + s.buffer.toFixed(2) + ' point buffer' + (sv.assess > rate + s.buffer + 1e-9 ? ', lifted to the floor rate' : ''));
  }

