// mend-btc-swing: a long-only cbBTC/USDC bot for the make.fun bars-replay/v1 race.
//
// Fitted on the one real out-of-sample window we have. On the 16 Nov race the top ten made +2.0% to +2.4% with
// 2-8 trades while buy-and-hold made +0.11%, so the winners traded the intraday swings and paid the round trip
// only a handful of times. The 23 Nov dev leaders' 400+ trades do not transfer: at a full-size round trip of
// about 46 bps (fee, slippage and pool impact), 459 round trips cost more than the whole capital.
//
// The rule, all from bars already closed (an order decided on a bar fills at the next open):
//   - Buy: when flat and the close has fallen DIP_BPS under the highest close of the last LOOKBACK bars.
//   - Sell: when the close is TAKE_BPS over the entry, or STOP_BPS under it, or after MAX_HOLD bars.
// Fitted by a sweep over both published windows (swing.py): LOOKBACK 240, DIP 120 bps, TAKE 150 bps, STOP 400,
// MAX_HOLD 240. That gave +16.45 USDC on the 16 Nov race window (the real winners: +20 to +24) and +15.56 on
// the 23 Nov dev window, against buy-and-hold's +1.07 and +32.17. Six trades on each.
//
// Integer arithmetic throughout, no clock, no randomness: two runs on the same window are byte-identical.

import { runBars, type Batch, type BarsState, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
const BPS = 10_000n;
const LOOKBACK = 240;
const DIP_BPS = 120n;
const TAKE_BPS = 150n;
const STOP_BPS = 400n;
const MAX_HOLD = 240;
const MAX_SLIPPAGE_BPS = 200;

const closes: bigint[] = [];
let entry = 0n;
let heldBars = 0;

await runBars({
  onBatch(state: BarsState, batch: Batch) {
    const bar = batch.bars[0];
    if (bar === undefined) return [];
    const close = BigInt(bar.c);
    closes.push(close);
    if (closes.length > LOOKBACK + 1) closes.shift();

    const position = state.account.positions[0];
    const held = position !== undefined && BigInt(position.qty) > 0n;

    if (held) {
      heldBars += 1;
      const take = entry > 0n && (close - entry) * BPS >= TAKE_BPS * entry;
      const stop = entry > 0n && (entry - close) * BPS >= STOP_BPS * entry;
      if (take || stop || heldBars >= MAX_HOLD) {
        const sell: SellInput = { side: 'sell', symbol: SYMBOL, qty: position.qty, max_slippage_bps: MAX_SLIPPAGE_BPS };
        entry = 0n;
        heldBars = 0;
        return [sell];
      }
      return [];
    }

    if (closes.length <= LOOKBACK) return [];
    let high = close;
    for (const c of closes) if (c > high) high = c;
    if ((high - close) * BPS < DIP_BPS * high) return [];

    const cash = BigInt(state.account.cash_quote_units);
    if (cash <= 0n) return [];
    entry = close;
    heldBars = 0;
    const buy: BuyInput = {
      side: 'buy',
      symbol: SYMBOL,
      notional_quote_units: cash.toString(),
      max_slippage_bps: MAX_SLIPPAGE_BPS,
    };
    return [buy];
  },
});
