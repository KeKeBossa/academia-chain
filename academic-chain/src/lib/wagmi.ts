import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { polygonAmoy, sepolia, mainnet } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'demo-project-id';
const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY ?? 'demo';

export const wagmiConfig = getDefaultConfig({
  appName: 'Academic Blockchain Repository',
  projectId,
  chains: [sepolia, polygonAmoy, mainnet],
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
    [polygonAmoy.id]: http(`https://polygon-amoy.g.alchemy.com/v2/${alchemyApiKey}`),
  },
});
