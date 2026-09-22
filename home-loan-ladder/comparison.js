"use strict";
  function renderComparison(s){
    var key = horizon==='full' ? 'costFull' : 'cost5';
    $('costHd').textContent = horizon==='full' ? 'Cost of credit · ' + s.term + ' yrs' : 'Cost of credit · 5 yrs';

    var rows = LENDERS.map(function(L){
      var pick = cheapestProduct(L, s, key);
      return pick ? { L:L, available:true, product:pick.product, ev:pick.ev, metric: pick.ev[key] }
                  : { L:L, available:false };
    });
    var avail = rows.filter(function(r){ return r.available; });
    var na = rows.filter(function(r){ return !r.available; });
    avail.sort(function(a,b){ return a.metric - b.metric; });

    var body = $('cmpBody'); body.innerHTML = '';
    avail.concat(na).forEach(function(r, i){
      var tr = document.createElement('tr');
      if(r.available && i===0) tr.className='best';
      if(!r.available) tr.className='na';
      var c1 = document.createElement('td');
      c1.innerHTML = '<span class="cellname"></span><span class="cellprod"></span>';
      c1.querySelector('.cellname').textContent = r.L.name;
      c1.querySelector('.cellprod').textContent = r.available
        ? r.product.name + (r.product.fixed ? '  ·  FIXED RATE' : '') + (r.product.indicative ? '  ·  INDICATIVE' : '')
        : 'no published tier at this LVR';
      tr.appendChild(c1);
      function td(txt, cls){ var d=document.createElement('td'); d.className=cls||''; d.textContent=txt; tr.appendChild(d); }
      if(r.available){
        td(pct(r.ev.rate), 'num lead');
        td(pct(r.ev.comp), 'num');
        td(money(r.ev.payment), 'num');
        var fees = [];
        if(r.ev.annualFee>0) fees.push(money(r.ev.annualFee)+'/yr');
        if(r.ev.upfrontFee>0) fees.push(money(r.ev.upfrontFee)+' once');
        td(fees.length ? fees.join(' + ') : '—', 'num');
        td(money(horizon==='full' ? r.ev.costFull : r.ev.cost5), 'num lead hot');
        td(r.ev.maxLvr + '%', 'num');
      } else {
        td('—'); td('—'); td('—'); td('—'); td('—');
        td(productMaxLvr(r.L.products[0]) + '%', 'num');
      }
      body.appendChild(tr);
    });

    var note = $('cmpNote');
    if(avail.length>=2){
      var cheap = avail[0], dear = avail[avail.length-1];
      var byRate = avail.slice().sort(function(a,b){ return a.ev.rate - b.ev.rate; });
      var sameOrder = byRate.map(function(r){return r.L.id;}).join() === avail.map(function(r){return r.L.id;}).join();
      var feeSpread = Math.max.apply(null, avail.map(function(r){ return r.ev.annualFee*5 + r.ev.upfrontFee; }));
      var win = horizon==='full' ? s.term : 5;

      var html = '<p><strong>Cost of credit</strong> is what the loan actually takes off you over the window — interest paid, plus annual and establishment fees, plus any LMI premium. '
        + 'It is the figure to compare, because it is the only one that folds fees and insurance in with the rate.</p>';

      html += '<p>Ranked this way the order is <strong>' + (sameOrder ? 'the same as ranking by rate' : 'different from ranking by rate') + '</strong> on your numbers, and it is worth seeing why. '
        + 'Over ' + win + ' years the leading lender pays about <strong>' + money(cheap.ev[key] - cheap.ev.annualFee*win - cheap.ev.upfrontFee - cheap.ev.lmi)
        + '</strong> in interest, while the largest fee load among these lenders is <strong>' + money(feeSpread) + '</strong> across five years. '
        + 'Fees are roughly two orders of magnitude smaller than interest at this loan size, so they shade the total without ever overturning a rate gap. '
        + 'That is a real result rather than a quirk: at ' + money(s.baseLoan) + ' borrowed, chasing a $395 package fee is not where the money is — '
        + 'ten basis points on the rate is worth more than the fee, every year.</p>';

      html += '<p>The spread between sharpest and dearest is <strong>' + (dear.ev.rate - cheap.ev.rate).toFixed(2)
        + ' percentage points</strong> — about <strong>' + money(dear.ev.payment - cheap.ev.payment) + ' a ' + freqNoun(s.perYear)
        + '</strong>, and <strong>' + money(dear.ev[key] - cheap.ev[key]) + '</strong> over ' + win + ' years. '
        + 'Where fees do decide things is <em>within</em> a lender: switch the product dropdown above between a no-frills loan and a packaged one to see the same bank priced both ways.</p>';

      html += '<p>Each lender is shown at its cheapest product available at this LVR. '
        + 'Rows marked <code>FIXED RATE</code> are not like-for-like — the rate holds only for the fixed term, and the full-term figure assumes it runs the distance, which understates the real cost. '
        + 'Rows marked <code>INDICATIVE</code> are negotiated pricing shown at the ceiling of a published range.</p>';
      note.innerHTML = html;
    } else {
      note.innerHTML = '<p>Only one lender in this comparison publishes a tier at this LVR. Above 90% the published market thins out sharply and pricing moves to negotiation.</p>';
    }
  }

  function renderCliffProse(L, P, ev, s){
    var lines = [];
    lines.push('<p>Every lender here prices risk in steps, not a curve. Crossing from a 20% deposit to a 19.9% one moves you into a new tier and, on most products, triggers a one-off insurance premium you pay for and the lender benefits from. Three separate things change at the line:</p>');

    var steps = LENDERS.map(function(X){
      var p80=null, p90=null;
      X.products.forEach(function(pr){
        var t80 = tierFor(pr, 80), t90 = tierFor(pr, 90);
        if(t80 && (p80===null || t80.rate < p80)) p80 = t80.rate;
        if(t90 && productMaxLvr(pr)>=90 && (p90===null || t90.rate < p90)) p90 = t90.rate;
      });
      return { name:X.name, bp:(p80!==null && p90!==null) ? Math.round((p90-p80)*100) : null };
    }).filter(function(x){ return x.bp!==null; }).sort(function(a,b){ return a.bp-b.bp; });

    lines.push('<p><strong>1. The rate tier steps.</strong> Each lender’s best 80% rate against its best 90% rate: '
      + steps.map(function(x){ return '<strong>' + x.name + '</strong> +' + x.bp + ' bp'; }).join(', ')
      + '. NAB’s flat Base Variable is why it sits at the bottom of that list and near the top of the rate table — you pay for the flatness in the 80% tier.</p>');

    var l90 = lmiPct(90, s.baseLoan), l95 = lmiPct(95, s.baseLoan);
    lines.push('<p><strong>2. LMI arrives.</strong> On ' + money(s.baseLoan) + ', indicative premiums run around <strong>' + l90.toFixed(2) + '%</strong> ('
      + money(s.baseLoan*l90/100) + ') at a 10% deposit and <strong>' + l95.toFixed(2) + '%</strong> (' + money(s.baseLoan*l95/100)
      + ') at a 5% deposit. It is a one-off, usually capitalised, and it insures the lender rather than you. The premium is not linear — it roughly doubles between the 86–90% and 91–95% bands.</p>');

    lines.push('<p><strong>3. The product menu shrinks.</strong> CommBank’s Digi Home Loan stops at 80% LVR, so its sharpest rate is unavailable below a 20% deposit. ING Mortgage Simplifier now publishes tiers through 95% LVR. ANZ Simplicity PLUS stops at 90%. ME Bank EconoME, Westpac, NAB, CommBank’s other products and Macquarie publish rates through 95% in the rate cards used here.</p>');

    var d20 = s.price*0.20, dutyNow = s.duty.duty;
    lines.push('<p><strong>Stamp duty competes with the deposit for the same cash.</strong> On a ' + money(s.price) + ' purchase in '
      + DUTY[s.stateCode].label + ', duty of ' + money(dutyNow) + ' plus ' + money(s.otherCosts) + ' of settlement costs is '
      + money(dutyNow + s.otherCosts) + ' that cannot go into the deposit. Reaching a 20% deposit therefore needs '
      + money(d20 + dutyNow + s.otherCosts) + ' saved, not ' + money(d20) + ' — which is the real reason so many buyers land in the 85–90% band rather than at 80%.</p>');

    lines.push('<p><strong>What changes the arithmetic.</strong> The Australian Government 5% Deposit Scheme removes the LMI premium entirely for eligible first home buyers — but not the rate step — and since 1 October 2025 has no income cap. A family guarantee over a parent’s equity can take the effective LVR back under 80%, removing both the premium and the step. ANZ waives LMI for members of certain professions regardless of deposit. Any one of these is usually worth more than the entire rate spread on this page, which is why the deposit conversation should happen before the rate conversation.</p>');

    $('cliffProse').innerHTML = lines.join('');
  }

