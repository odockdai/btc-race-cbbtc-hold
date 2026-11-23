// mend-btc: a long-only minute bot for cbBTC/USDC on the Orca Whirlpool replay.
//
// What the dev window showed (1,440 one-minute bars, +3.59% over the day): the price drifts up, but with a
// 7.5 bps standard deviation per bar and 218 flat bars. Buying and holding earned +32.17 USDC; an EMA cross
// earned less and paid 76 fills of fees. So the edge here is not prediction, it is cost: hold the asset, and
// sell only when a fall is big enough to beat the round trip (2 x (4 bps fee + 2 bps slippage) plus impact).
//
// The rules, all from the bars already closed (an order decided on a bar fills at the next open):
//   - Buy: when flat, buy with all the cash once the close has risen at least ENTRY_BPS over the lowest close
//     of the last LOOKBACK bars (a confirmed upswing), or on the first bar if that never happened.
//   - Sell: when holding, sell when the close falls DRAWDOWN_BPS under the highest close since the buy, or
//     when the position is worth STOP_BPS under its cost. Both are far above the round-trip cost, so a sell
//     is never a fee donation.
//   - Re-entry: after a sell, buy again on the same upswing rule, so a dip is bought back cheaper.
// Every order caps its slippage at MAX_SLIPPAGE_BPS below/above the close it was decided on, so a fill into a
// liquidity gap is refused rather than taken at a bad price.

import { runBars, type Batch, type BarsState, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

/** Closes kept for the upswing test. */
const LOOKBACK = 30;
/** Close at least this far over the lookback's lowest close: a confirmed upswing. */
const ENTRY_BPS = 5n;
/** Sell when the close falls this far under the highest close since the buy. */
const DRAWDOWN_BPS = 250n;
/** Sell when the position is worth this far under its cost. */
const STOP_BPS = 300n;
const MAX_SLIPPAGE_BPS = 150n;
const BPS = 10_000n;

const closes: bigint[] = [];
let peak = 0n;
let cost = 0n;

await runBars({
  onBatch(state: BarsState, batch: Batch) {
    const bar = batch.bars[0];
    if (bar === undefined) return [];
    const close = BigInt(bar.c);
    closes.push(close);
    if (closes.length > LOOKBACK) closes.shift();

    const position = state.account.positions[0];
    const held = position !== undefined && BigInt(position.qty) > 0n;

    if (held) {
      if (close > peak) peak = close;
      const underPeak = (peak - close) * BPS;
      const underCost = (cost - close) * BPS;
      const drawdownHit = peak > 0n && underPeak >= DRAWDOWN_BPS * peak;
      const stopHit = cost > 0n && underCost >= STOP_BPS * cost;
      if (drawdownHit || stopHit) {
        peak = 0n;
        cost = 0n;
        const sell: SellInput = { side: 'sell', symbol: 'CBBTC', qty: position.qty, max_slippage_bps: Number(MAX_SLIPPAGE_BPS) };
        return [sell];
      }
      return [];
    }

    // Flat: buy on a confirmed upswing, or on the first bar that has a full lookback.
    let low = close;
    for (const c of closes) if (c < low) low = c;
    const upswing = (close - low) * BPS >= ENTRY_BPS * low;
    const cash = BigInt(state.account.cash_quote_units);
    if (!upswing || cash <= 0n) return [];
    peak = close;
    cost = close;
    const buy: BuyInput = { side: 'buy', symbol: 'CBBTC', notional_quote_units: cash.toString(), max_slippage_bps: Number(MAX_SLIPPAGE_BPS) };
    return [buy];
  },
});
