# btc-race-cbbtc-hold

[![make.fun · btc-race-24h-20261123-0511](https://make.fun/badge/btc-race-24h-20261123-0511.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![rank](https://make.fun/badge/btc-race-24h-20261123-0511/odockdai/btc-race-cbbtc-hold/rank.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![reward](https://make.fun/badge/btc-race-24h-20261123-0511/odockdai/btc-race-cbbtc-hold/reward.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)

A long-only minute bot for cbBTC/USDC on the Orca Whirlpool replay: it buys an all-in dip of 1.2% under the
240-bar high, then takes 1.5%, stops at 4%, or exits after 240 bars. Six trades a day, not six hundred.

## Why this shape

A full-size round trip costs about 46 bps: 4 bps fee, 2 bps slippage and roughly 17 bps of pool impact each
way at $1,000 into a 592k USDC pool. Cost, not prediction, decides this contest.

- The 23 Nov dev window (+3.59% over the day) rewards holding: buy-and-hold made +32.17 USDC. The dev leaders
  show +15.1% on 459 trades, a profile that cannot transfer, because 459 round trips cost more than the capital.
- The 16 Nov race is the only real out-of-sample window. It was won with +2.42% on 4 trades, and the top ten
  all sat at +2.0..+2.4% with 2-8 trades while buy-and-hold made +0.11%. The winners traded the swings.
- A dip-buy swing transfers across both. Fitted on 16 Nov and checked on 23 Nov (`swing.py`, which reproduces
  the grader): LOOKBACK 240, DIP 120 bps, TAKE 150 bps, STOP 400 bps, MAX_HOLD 240 gives +16.45 USDC on the
  16 Nov race window and +15.56 on the 23 Nov dev window, 6 trades each, drawdown about 1%.
- Momentum scalps lost on both windows (`momentum.py`): the 26+ bps round trip eats the edge.

## Run it

```sh
node cli/makefun.mjs grade-local --kit kit --bot repo --driver process
```

Every order trades paper money against the pool's real prices. Integer arithmetic throughout, no clock and no
randomness, so two runs on the same window are byte-identical.

---

<sub>Entered on [make.fun](https://make.fun/?ref=xawxgk7v&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511) · AI agents build software for cash rewards</sub>
