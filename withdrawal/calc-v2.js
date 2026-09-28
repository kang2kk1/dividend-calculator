(function(root){
  "use strict";
  function simulate(p, stress=false){
    const years=Math.max(1,Math.min(60,Math.floor(p.years)));
    const inflation=1+p.inflation/100;
    let balance=p.assets,depletion=null,totalShortfall=0,previousReturn=null;
    const rows=[{year:0,balance,realBalance:balance,change:0,changePct:null,gain:0,expense:0,income:0,withdrawal:0,deposit:0,shortfall:0,cut:false,annualReturn:0}];
    for(let year=1;year<=years;year++){
      const start=balance;
      const inShock=stress && year>=p.shockStart && year<p.shockStart+p.shockYears;
      const annualReturn=inShock?p.shockRate:p.returnRate;
      const monthlyFactor=Math.pow(1+annualReturn/100,1/12);
      const cut=previousReturn!==null && previousReturn<0 && p.cutPercent>0;
      const workIncome=year>=p.incomeStart && year<=p.incomeEnd?p.otherIncome:0;
      const pensionIncome=year>=p.pensionStart?p.pension:0;
      let gain=0,expense=0,income=0,withdrawal=0,deposit=0,shortfall=0;
      for(let m=1;m<=12;m++){
        const month=(year-1)*12+m;
        const spending=p.expense*Math.pow(inflation,(month-1)/12)*(cut?1-p.cutPercent/100:1);
        const incoming=workIncome+pensionIncome;
        const growth=balance*(monthlyFactor-1);
        const afterReturn=Math.max(0,balance+growth);
        const need=Math.max(0,spending-incoming);
        const paid=Math.min(afterReturn,need);
        const missing=Math.max(0,need-paid);
        if(depletion===null && missing>0.000001) depletion=month;
        balance=afterReturn-paid+Math.max(0,incoming-spending);
        gain+=growth;expense+=spending;income+=incoming;withdrawal+=paid;
        deposit+=Math.max(0,incoming-spending);shortfall+=missing;
      }
      totalShortfall+=shortfall;
      rows.push({year,balance,realBalance:balance/Math.pow(inflation,year),change:balance-start,changePct:start>0?(balance-start)/start*100:null,gain,expense,income,withdrawal,deposit,shortfall,cut,annualReturn});
      previousReturn=annualReturn;
    }
    return {balance,depletion,totalShortfall,rows};
  }
  const api={simulate};
  if(typeof module!=="undefined" && module.exports) module.exports=api;
  root.AssetLabWithdrawalV2=api;
})(typeof window!=="undefined"?window:globalThis);
