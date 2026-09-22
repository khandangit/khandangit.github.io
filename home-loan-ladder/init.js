"use strict";
  /* ---------- wiring ---------- */
  function syncCashFromPct(){
    if(syncing) return;
    syncing = true;
    $('cash').value = Math.round(Math.max(1,num('price')) * num('cashPct')/100);
    syncing = false; render();
  }
  function syncPctFromCash(){
    if(syncing) return;
    syncing = true;
    var p = Math.min(45, Math.max(2, (num('cash')/Math.max(1,num('price')))*100));
    $('cashPct').value = p.toFixed(1);
    syncing = false; render();
  }

  ['price','term','inc1','inc2','incOther','expenses','deps','otherDebt','cardLimit','buffer','floorRate','otherCosts']
    .forEach(function(id){ $(id).addEventListener('input', render); });
  ['freq','state'].forEach(function(id){ $(id).addEventListener('change', render); });
  ['capLmi','scheme','fhb'].forEach(function(id){ $(id).addEventListener('change', render); });
  $('cash').addEventListener('input', syncPctFromCash);
  $('cashPct').addEventListener('input', syncCashFromPct);
  $('price').addEventListener('input', syncPctFromCash);
  $('product').addEventListener('change', function(){ selectedProduct = this.value; render(); });

  $('cashSeg').addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b) return;
    cashMode = b.dataset.mode;
    Array.prototype.forEach.call(this.querySelectorAll('button'), function(x){
      x.setAttribute('aria-pressed', x===b ? 'true' : 'false');
    });
    render();
  });
  $('sortSeg').addEventListener('click', function(e){
    var b = e.target.closest('button'); if(!b || !b.dataset.horizon) return;
    horizon = b.dataset.horizon;
    Array.prototype.forEach.call(this.querySelectorAll('button'), function(x){
      x.setAttribute('aria-pressed', x===b ? 'true' : 'false');
    });
    render();
  });

  render();
