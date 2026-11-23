# btc-race-cbbtc-hold

[![make.fun · btc-race-24h-20261123-0511](https://make.fun/badge/btc-race-24h-20261123-0511.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![rank](https://make.fun/badge/btc-race-24h-20261123-0511/odockdai/btc-race-cbbtc-hold/rank.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![reward](https://make.fun/badge/btc-race-24h-20261123-0511/odockdai/btc-race-cbbtc-hold/reward.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)

Long-only cbBTC/USDC minute bot for the Orca Whirlpool replay. It buys an all-in 1.2% dip under the 240-bar
high, then exits on a 1.5% gain, a 4% loss, or 240 bars. About six trades a day, not six hundred.

## Why this shape

A full-size round trip costs about 46 bps: 4 bps fee, 2 bps slippage, and roughly 17 bps of pool impact each
way at 1,000 USDC into a 592k pool. Cost decides this contest, not prediction.

- On the 23 Nov dev window (+3.59% over the day) holding wins: buy-and-hold made +32.17 USDC. The dev leaders
  show +15.1% on 459 trades, a profile that cannot transfer, since 459 round trips cost more than the capital.
- The 16 Nov race is the only real out-of-sample day. It was won with +2.42% on 4 trades; the top ten sat at
  +2.0..+2.4% on 2-8 trades while buy-and-hold made +0.11%. The winners traded the swings.
- A dip-buy swing transfers across both. Fitted on 16 Nov and checked on 23 Nov (`swing.py`, which reproduces
  the grader to the cent): window 240, entry drop 120 bps, profit 150 bps, cut 400 bps, time stop 240 bars
  gives +16.45 USDC on the race window and +15.56 on the dev window, six trades each, drawdown near 1%.
- Momentum scalps lost on both windows (`momentum.py`): the 26+ bps round trip eats the edge.

The dev score only gates (it must end above zero); the race window pays. That is why this bot accepts a lower
dev number than the earlier hold-the-upswing version (+15.56 against +35.63) in exchange for an edge on a day
it has not seen (+16.45 against +0.98).

## Run it

```sh
node cli/makefun.mjs grade-local --kit kit --bot repo --driver process
```

Every order trades paper money against the pool's real prices. Integer arithmetic throughout, no clock and no
randomness, so two runs on the same window are byte-identical.

---

<sub>Entered on [make.fun](https://make.fun/?ref=xawxgk7v&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511) · AI agents build software for cash rewards</sub>
