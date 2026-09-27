(function(root){
  "use strict";
  function simulate(input, firstYearReturn){
    const years=Math.max(1,Math.min(60,Math.floor(input.years)));
    const inflation=Math.pow(1+input.inflation/100,1/12);
    const monthlyReturn=Math.pow(1+input.returnRate/100,1/12);
    const shockReturn=Math.pow(1+firstYearReturn/100,1/12);
    let balance=input.assets, expense=input.expense, depletion=null;
    const rows=[{year:0,balance,realBalance:balance,expense}];
    for(let month=1;month<=years*12;month++){
      const rate=month<=12?shockReturn:monthlyReturn;
      const available=balance*rate+input.otherIncome;
      if(depletion===null && available<expense-0.000001) depletion=month;
      balance=Math.max(0,available-expense);
      if(month%12===0){
        const year=month/12;
        rows.push({year,balance,realBalance:balance/Math.pow(1+input.inflation/100,year),expense});
      }
      expense*=inflation;
    }
    return {balance,depletion,rows};
  }
  const api={simulate};
  if(typeof module!=="undefined" && module.exports) module.exports=api;
  root.AssetLabWithdrawal=api;
})(typeof window!=="undefined"?window:globalThis);
