# Blockchain Voting System

A decentralized voting application built on the Ethereum blockchain that allows for secure, transparent, and tamper-proof voting campaigns.

## Project Overview

This project implements a voting system on the blockchain with the following features:
- Create and manage voting campaigns
- Add candidates to campaigns
- Set campaign duration and start times
- Vote securely with prevention of double voting
- View real-time voting results and status

The smart contract architecture consists of:
- **CampaignFactory**: Contract that creates and manages multiple voting campaigns
- **Campaign**: Individual voting campaign contract with candidate management and voting functionality

## Prerequisites

- [Node.js](https://nodejs.org/) (v14+ recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Ganache](https://trufflesuite.com/ganache/) - A personal blockchain for Ethereum development

## Setup Instructions

### 1. Install Dependencies

Clone the repository and install the required npm packages:

```bash
git clone https://github.com/DepartmentX/Solidity-Team.git
cd Solidity-Team
npm install
```

### 2. Set Up Ganache

1. Download and install Ganache from [https://trufflesuite.com/ganache/](https://trufflesuite.com/ganache/)
2. Launch Ganache and quickstart with ethereum.
3. Once Ganache is running, it will provide you with:
   - An RPC server URL (typically `http://127.0.0.1:7545`)
   - A list of accounts with their private keys

### 3. Configure Environment Variables

1. Copy one of the private keys from Ganache (click the key icon next to any account)
2. Create or modify the [`.env`](.env ) file in the project root:

```
API_URL="http://127.0.0.1:7545"
PRIVATE_KEY="<your-private-key-from-ganache>"
```

Make sure to replace `<your-private-key-from-ganache>` with the actual private key you copied.

### 4. Compile Smart Contracts

Compile the Solidity contracts using Hardhat:

```bash
npx hardhat compile
```

### 5. Deploy Smart Contracts

Deploy the contracts to your local Ganache blockchain:

```bash
npx hardhat run --network ganache scripts/deploy.js
```

After successful deployment, you'll see a message with the deployed contract address:
```
✅ CampaignFactory deployed at: 0x...
```

Save this contract address as you'll need it for frontend integration or interacting with the contract.

## Contract Interaction

The deployed contracts allow you to:

1. Create new voting campaigns
2. Add candidates to campaigns
3. Vote for candidates
4. View voting results

You can interact with the contracts through:
- A frontend application connected to the contracts
- Hardhat console
- Remix IDE by importing the deployed contract address

## Testing

The project includes tests for the smart contracts. Run tests with:

```bash
npx hardhat test
```

## Security Considerations

- Only the campaign owner can add new candidates
- Voters can only vote once per campaign
- Voting is only allowed during the campaign's active period
- Campaign data is stored transparently on the blockchain

## License

This project is licensed under the ISC License.