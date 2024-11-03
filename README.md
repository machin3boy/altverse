# Altverse

Altverse is a protocol that enables trustless cross-chain trading without traditional bridges, using Wormhole's messaging system for secure asset transfers across any supported blockchain network. The protocol supports established token standards (ERC20, SPL, etc.) and addresses fragmented liquidity through native DEX integration, while providing built-in escrow protection and novel arbitrage opportunities to create deeper, more efficient markets across networks. Through established stablecoin on/off ramps, Altverse could potentially bridge traditional financial markets with decentralized ecosystems.

![image](https://github.com/user-attachments/assets/9c93584a-d112-4632-81d8-b8959e5b4674)

## Quick Links
- 🌐 [Website](https://altverse.link)
- 📄 [Technical Whitepaper](https://altverse.link/whitepaper.pdf)

## Local Development

### Docker Setup
```bash
docker build -t altverse -f site/Dockerfile site
docker run -it -p 3000:3000 altverse
```

### NPM Setup
```bash
cd site
npm install && npm run dev
```

Once running, visit [https://localhost:3000](https://localhost:3000) to view the site.

## Smart Contracts

### Contract Deployments
`Altverse.sol` is deployed on multiple testnets:

| Network | Address | Explorer |
|---------|---------|----------|
| Celo Alfajores | `0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B` | [View on Celoscan](https://alfajores.celoscan.io/address/0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B) |
| Optimism Sepolia | `0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B` | [View on Etherscan](https://sepolia-optimism.etherscan.io/address/0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B) |
| Avalanche Fuji | `0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B` | [View on Snowtrace](https://testnet.snowtrace.io/address/0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B) |

### Verified Contracts
- [Verified Contract on Celoscan](https://sepolia-optimism.etherscan.io/address/0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B#code)
- [Verified Contract on Etherscan](https://sepolia-optimism.etherscan.io/address/0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B)

### Source Code
Full smart contract implementations and documentation can be found in the [contracts directory](./contracts).

