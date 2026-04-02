# Resale Radar

Resale Radar is a lightweight local resale estimator. It helps you decide if an item is worth flipping by combining:

- Local comparable sold listings (price, condition, recency, distance)
- City-level market behavior (trend, demand/supply pressure, volatility, liquidity speed)
- Your cost basis and selling fees

## Run locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## How it works

1. Computes a weighted average from comparables.
2. Adjusts by category behavior, city trend, demand/supply pressure, speed-to-sale, and volatility discount.
3. Produces estimated market value, suggested list price, projected profit/ROI, confidence, and an opportunity score.
4. Recommends whether to attempt reselling.

> This tool is directional, not financial advice.
