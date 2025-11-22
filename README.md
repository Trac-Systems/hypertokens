# Hypertokens

![image](https://github.com/user-attachments/assets/1cb598d9-7fc7-4248-9615-e36268ffd4bb)

Website / HyperFUN App Downloads: https://hyperfun.wtf

A proposal for a p2p token standard on Trac Network. See /contract/contract.js and /contract/protocol.js.

The protocol requires TAP tokens from Bitcoin as app-gas.

Hypertokens define the most simplistic token standard possible and can be operated in terminal (no special transactions required).

It supports signed and fair mints. Signed mints enable deployers to limit mints for selected wallets.

Additionally, there is also curve based minting, akin to Pump.fun but with a few tweaks:

- You can set a target price in TAP tokens (see Bitcoin's TAP Protocol)
- You can set the supply
- You can set block durations from 1-300 blocks per mint (Bitcoin blocks)
- Uses 1/3 of the TAP liquidity for secured floors
- Mintfun: Mint tokens for TAP a the current curve price (cannot get higher than target price)
- Refun: If a token isn't graduating, you can refund yourself in TAP and try to mint another token
- Burnfun: Burn tokens to return TAP at the 1/3 price-ratio
- Graduated tokens are available as pairs and 2/3 of the TAP liquidity at [Hypermall](https://hypermall.io)
- Gas applies for transactions (0.01 TAP / TX)
- Min. graduation liquidity required to get a token listed in Hypermall: 3,000 TAP

This contract is instantly executable, see instructions below.

## Install

Make sure to have git and node installed.

```shell
git clone https://github.com/Trac-Systems/hypertokens.git
```

## Run in GUI mode

```js
cd hypertokens
npm install -g pear
npm install
pear run . store1
```

## Update

```shell
cd hypertokens (if not already done)
git clone https://github.com/Trac-Systems/hypertokens.git temp
```

```js
cp -fr temp/* .
rm -fr temp
npm update
pear run . store1
```
If you don't want to run the Hyperfun GUI, then simply run

```js
pear run src/main.js store1
```

Use the commands in the Hypertokens section to deploy, mint, transfer.

If your peer errors "not writable", just restart to auto-join.

To simulate transactions, append a "--sim 1" to your Hypertokens commands.

Chat system is enabled.

To enable log output in the terminal (what's minting), set the following to true in the index.js:

```js
peer_opts.enable_logs = true;
peer_opts.enable_txlogs = false;
```

