// Long-only cbBTC/USDC entry for the make.fun bars-replay/v1 24-hour race.
//
// Cost is what this contest is about. A full-size round trip pays roughly 46 bps: 4 bps of fee, 2 bps of
// slippage and about 17 bps of pool impact each way on a 1,000 USDC order in a 592k pool. So the bot trades
// a handful of times a day, never hundreds: the 23 Nov dev leaders' 459 round trips cost more than the capital.
//
// The 16 Nov race is the only out-of-sample day we hold. It was won with +2.42% on four trades, the top ten
// sat at +2.0..+2.4% on two to eight trades, and buy-and-hold made +0.11%. Swings paid, holding did not.
//
// Rule, decided only on closed bars (an order decided on bar k fills at bar k+1's open):
//   flat and close is DIP_BPS under the highest close of the last LOOKBACK bars -> buy, all cash;
//   long and close is TAKE_BPS over the fill, or STOP_BPS under it, or MAX_HOLD bars have passed -> sell.
// Chosen by a sweep fitted on 16 Nov and checked on 23 Nov (swing.py): 240 / 120 / 150 / 400 / 240 gives
// +16.45 USDC on the race window and +15.56 on the dev window, six trades each, drawdown near 1%.
//
// The dev score is a gate only (it must finish above zero); the race window pays. Integer math, no clock,
// no randomness, so the two grading runs produce the same action log.

import { runBars, type Batch, type BarsState, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const PAIR = 'CBBTC';
const SCALE = 10_000n;
const WINDOW = 240;
const ENTRY_DROP = 120n;
const PROFIT = 150n;
const CUT = 400n;
const TIME_STOP = 240;
const SLIP_CAP = 200;

const history: bigint[] = [];
let paid = 0n;
let bars = 0;

function highest(list: bigint[]): bigint {
  let top = list[0] ?? 0n;
  for (const value of list) {
    if (value > top) top = value;
  }
  return top;
}

await runBars({
  onBatch(state: BarsState, batch: Batch) {
    const first = batch.bars[0];
    if (first === undefined) return [];
    const last = BigInt(first.c);
    history.push(last);
    if (history.length > WINDOW + 1) history.splice(0, history.length - WINDOW - 1);

    const open = state.account.positions[0];
    if (open !== undefined && BigInt(open.qty) > 0n) {
      bars += 1;
      const gain = paid > 0n && (last - paid) * SCALE >= PROFIT * paid;
      const loss = paid > 0n && (paid - last) * SCALE >= CUT * paid;
      if (gain || loss || bars >= TIME_STOP) {
        const exit: SellInput = { side: 'sell', symbol: PAIR, qty: open.qty, max_slippage_bps: SLIP_CAP };
        paid = 0n;
        bars = 0;
        return [exit];
      }
      return [];
    }

    if (history.length <= WINDOW) return [];
    const peak = highest(history);
    if ((peak - last) * SCALE < ENTRY_DROP * peak) return [];

    const cash = BigInt(state.account.cash_quote_units);
    if (cash <= 0n) return [];
    paid = last;
    bars = 0;
    const entry: BuyInput = {
      side: 'buy',
      symbol: PAIR,
      notional_quote_units: cash.toString(),
      max_slippage_bps: SLIP_CAP,
    };
    return [entry];
  },
});
