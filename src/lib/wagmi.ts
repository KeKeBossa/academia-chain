import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { polygonAmoy, sepolia } from 'wagmi/chains';

const WEB3MODAL_API_HOST = 'api.web3modal.org';

if (typeof window === 'undefined' && typeof fetch === 'function') {
  const originalFetch = fetch;
  const patched = (input: RequestInfo | URL, init?: RequestInit) => {
    const target =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : 'url' in input
            ? input.url
            : '';

    if (target.includes(WEB3MODAL_API_HOST)) {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            features: {},
            project: { id: 'local-dev', name: 'local-dev' }
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' }
          }
        )
      );
    }

    return originalFetch(input, init);
  };

  globalThis.fetch = patched;
}

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'demo-project-id';

export const wagmiConfig = getDefaultConfig({
  appName: 'Academic Blockchain Repository',
  projectId,
  ssr: true,
  chains: [polygonAmoy, sepolia],
  transports: {
    [polygonAmoy.id]: http(
      process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL ?? 'https://polygon-amoy.g.alchemy.com/v2/demo'
    ),
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? 'https://eth-sepolia.g.alchemy.com/v2/demo'
    )
  }
});
