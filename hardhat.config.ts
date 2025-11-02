import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-ignition-ethers';
import 'dotenv/config';

const { SEPOLIA_RPC_URL, SEPOLIA_PRIVATE_KEY, POLYGON_AMOY_RPC_URL, POLYGON_AMOY_PRIVATE_KEY } =
  process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.26',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true,
      evmVersion: 'cancun'
    }
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_RPC_URL || '',
      accounts: SEPOLIA_PRIVATE_KEY ? [SEPOLIA_PRIVATE_KEY] : []
    },
    polygonAmoy: {
      url: POLYGON_AMOY_RPC_URL || '',
      accounts: POLYGON_AMOY_PRIVATE_KEY ? [POLYGON_AMOY_PRIVATE_KEY] : []
    }
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || '',
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || ''
    }
  }
};

export default config;
