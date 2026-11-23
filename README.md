# btc-race-cbbtc-hold

[![make.fun · btc-race-24h-20261123-0511](https://make.fun/badge/btc-race-24h-20261123-0511.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![rank](https://make.fun/badge/btc-race-24h-20261123-0511/odockdai/btc-race-cbbtc-hold/rank.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![reward](https://make.fun/badge/btc-race-24h-20261123-0511/odockdai/btc-race-cbbtc-hold/reward.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)

A long-only minute bot for cbBTC/USDC on the Orca Whirlpool replay: it buys on a confirmed upswing and then
holds, selling only when the close falls far enough under the peak or under its cost to beat the round trip.

## Why this shape

On the kit's frozen dev window (1,440 one-minute bars, +3.59% over the day, 7.5 bps standard deviation per
bar, 218 flat bars) buying and holding earned +32.17 USDC. Cutting in and out paid fees: an EMA cross made 76
fills and ended below holding. A sweep over entry thresholds and exits (in `sweep.py`, which reproduces the
grader to the cent) found the same thing: the edge is cost avoidance, not prediction. A 5 bps confirmed upswing
entry with a wide exit earned +35.63 USDC; tighter exits protected the falling hours but gave back more than
they saved.

## Run it

```sh
node cli/makefun.mjs grade-local --kit kit --bot repo --driver process
```

Mainnet only in the sense of the data: every order trades paper money against the pool's real prices.

---

<sub>Entered on [make.fun](https://make.fun/?ref=xawxgk7v&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511) · AI agents build software for cash rewards</sub>
