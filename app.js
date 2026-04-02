const compsTableBody = document.querySelector('#compsTable tbody');
const compTemplate = document.querySelector('#compRowTemplate');
const addCompBtn = document.querySelector('#addCompBtn');
const estimateBtn = document.querySelector('#estimateBtn');
const resultContainer = document.querySelector('#result');

const categoryMultipliers = {
  electronics: 0.98,
  fashion: 0.92,
  home: 0.95,
  collectibles: 1.06,
  sports: 0.97,
};

function addCompRow(defaults = {}) {
  const row = compTemplate.content.firstElementChild.cloneNode(true);
  row.querySelector('.comp-price').value = defaults.price ?? '';
  row.querySelector('.comp-condition').value = defaults.condition ?? 8;
  row.querySelector('.comp-age').value = defaults.age ?? 1;
  row.querySelector('.comp-distance').value = defaults.distance ?? 2;

  row.querySelector('.remove-comp').addEventListener('click', () => {
    row.remove();
  });

  compsTableBody.appendChild(row);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function numberValue(id) {
  return Number(document.getElementById(id).value || 0);
}

function getComparableRows() {
  return [...compsTableBody.querySelectorAll('tr')]
    .map((row) => ({
      price: Number(row.querySelector('.comp-price').value),
      condition: Number(row.querySelector('.comp-condition').value),
      age: Number(row.querySelector('.comp-age').value),
      distance: Number(row.querySelector('.comp-distance').value),
    }))
    .filter((comp) => Number.isFinite(comp.price) && comp.price > 0);
}

function weightedCompsAverage(comps, condition) {
  if (!comps.length) return null;

  let weightedTotal = 0;
  let weightSum = 0;

  for (const comp of comps) {
    const conditionAdj = 1 + (condition - comp.condition) * 0.015;
    const recencyWeight = 1 / (1 + comp.age * 0.12);
    const distanceWeight = 1 / (1 + comp.distance * 0.08);
    const weight = recencyWeight * distanceWeight;

    weightedTotal += comp.price * conditionAdj * weight;
    weightSum += weight;
  }

  return weightedTotal / weightSum;
}

function estimateResale() {
  const city = document.getElementById('city').value.trim() || 'your city';
  const itemName = document.getElementById('itemName').value.trim() || 'this item';
  const category = document.getElementById('category').value;
  const condition = clamp(numberValue('condition'), 1, 10);

  const acquisitionCost = numberValue('acquisitionCost');
  const feeRate = clamp(numberValue('feeRate'), 0, 100) / 100;
  const sellWindow = clamp(numberValue('sellWindow'), 1, 365);

  const trend30 = numberValue('trend30') / 100;
  const demandIndex = clamp(numberValue('demandIndex'), 0.5, 1.5);
  const supplyIndex = clamp(numberValue('supplyIndex'), 0.5, 1.5);
  const volatility = clamp(numberValue('volatility'), 0, 1);
  const avgDaysOnMarket = clamp(numberValue('avgDaysOnMarket'), 1, 365);

  const comps = getComparableRows();
  const compsValue = weightedCompsAverage(comps, condition);

  if (!compsValue) {
    resultContainer.classList.remove('hidden');
    resultContainer.innerHTML = '<h3>Add at least one comparable sold listing.</h3>';
    return;
  }

  const categoryFactor = categoryMultipliers[category] ?? 1;
  const trendFactor = 1 + trend30 * 0.65;
  const marketPressureFactor = demandIndex / supplyIndex;
  const speedFactor = clamp(avgDaysOnMarket / sellWindow, 0.75, 1.18);
  const riskDiscount = 1 - volatility * 0.12;

  const estimatedMarketValue =
    compsValue * categoryFactor * trendFactor * marketPressureFactor * speedFactor * riskDiscount;

  const quickSalePrice = estimatedMarketValue * 0.9;
  const stretchPrice = estimatedMarketValue * 1.08;
  const recommendedListPrice = (quickSalePrice + stretchPrice) / 2;

  const netAfterFees = recommendedListPrice * (1 - feeRate);
  const projectedProfit = netAfterFees - acquisitionCost;
  const roi = acquisitionCost > 0 ? (projectedProfit / acquisitionCost) * 100 : 0;

  const confidence = clamp(
    35 + Math.min(comps.length, 10) * 6 + (1 - volatility) * 20 - Math.abs(trend30 * 100) * 0.4,
    20,
    95,
  );

  const opportunityScore = clamp(
    45 + roi * 0.35 + (demandIndex - supplyIndex) * 30 + (sellWindow <= avgDaysOnMarket ? 10 : -4) - volatility * 12,
    0,
    100,
  );

  let recommendation = 'Watch only';
  if (projectedProfit > 0 && opportunityScore >= 70) recommendation = 'Strong buy to resell';
  else if (projectedProfit > 0 && opportunityScore >= 55) recommendation = 'Viable flip';
  else if (projectedProfit <= 0) recommendation = 'Not worth reselling';

  resultContainer.classList.remove('hidden');
  resultContainer.innerHTML = `
    <h3>${itemName} in ${city}</h3>
    <p><strong>Recommendation:</strong> ${recommendation}</p>
    <div class="result-grid">
      <div class="metric"><div class="label">Estimated Market Value</div><div class="value">$${estimatedMarketValue.toFixed(2)}</div></div>
      <div class="metric"><div class="label">Recommended List Price</div><div class="value">$${recommendedListPrice.toFixed(2)}</div></div>
      <div class="metric"><div class="label">Projected Profit</div><div class="value">$${projectedProfit.toFixed(2)}</div></div>
      <div class="metric"><div class="label">Projected ROI</div><div class="value">${roi.toFixed(1)}%</div></div>
      <div class="metric"><div class="label">Opportunity Score</div><div class="value">${opportunityScore.toFixed(0)}/100</div></div>
      <div class="metric"><div class="label">Confidence</div><div class="value">${confidence.toFixed(0)}%</div></div>
    </div>
    <p class="hint">Model blends local comps with trend, demand/supply pressure, liquidity speed, and volatility risk.</p>
  `;
}

addCompBtn.addEventListener('click', () => addCompRow());
estimateBtn.addEventListener('click', estimateResale);

addCompRow({ price: 420, condition: 8, age: 1, distance: 2 });
addCompRow({ price: 405, condition: 7, age: 2, distance: 4 });
addCompRow({ price: 440, condition: 9, age: 1, distance: 3 });
