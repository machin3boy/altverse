## Contracts

#### Instructions for consistency
- Set compiler to `0.8.25` 
- Set EVM version to `Paris`
- Set optimizations to 200 when compiling

#### Testnet USDC addresses
- `0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B` - Celo Alfajores testnet
- `0x5425890298aed601595a70ab815c96711a31bc65` - Avalanche Fuji testnet

#### Testnet chain IDs
- `14` - Celo Alfajores testnet 
- `6` - Avalanche Fuji testnet

#### Testnet WormholeRelayer addresses
- `0x306B68267Deb7c5DfCDa3619E22E9Ca39C374f84` - Celo Alfajores testnet
- `0xA3cF45939bD6260bcFe3D66bc73d60f19e49a8BB` - Avalanche Fuji testnet

#### Testnet faucets
- https://faucet.celo.org
- https://core.app/en/tools/testnet-faucet/?subnet=c

#### Testnet explorers
- https://alfajores.celoscan.io
- https://testnet.avascan.info

#### Deployment sequence
- Deploy `Altverse.sol` on both chains
- Call `setRegisteredSender` in `Altverse` contract on the opposite chain
- Deploy wrapped ERCs for testing at appropriate addresses
- Call `setDesignatedUSDC` in `Altverse` contract with appropriate USDC address
- Approve Altverse contract in `wBTC`, `wETH`, `wLINK` for spending to create LPs for `max(uint256)` amount
- `max(uint256)` = `115792089237316195423570985008687907853269984665640564039457584007913129639935`
```
1000 wBTC, 63244530.0 ALT, BTC priced at $63,244.53
10000 wETH, 24707300.0 ALT, ETH priced at $2470.73
1000000 wLINK, 10980000.0 ALT, LINK priced at $10.98
```
- Inject `1000000000000000000000 wBTC`, `63244530000000000000000000 ALT` as LP
- Inject `10000000000000000000000 wETH`, `24707300000000000000000000 ALT` as LP
- Inject `1000000000000000000000000 wLINK`, `10980000000000000000000000 ALT` as LP
- Can deploy using `deployment/scenario.json` 

#### Contract references (on all chains if deployed using `scenario.json`)

- `0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B` - `Altverse`
- `0xd6833DAAA48C127b2d007AbEE8d6b7f2CC6DFA36` - `wBTC`
- `0x1A323bD7b3f917A6AfFE320A8b3F266130c785b9` - `wETH`
- `0x0adea7235B7693C40F546E39Df559D4e31b0Cbfb` - `wLINK`
