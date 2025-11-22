import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
    arbitrum,
    base,
    mainnet,
    optimism,
    polygon,
    sepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Zadiction',
    projectId: 'YOUR_PROJECT_ID',
    chains: [
        mainnet,
        polygon,
        optimism,
        arbitrum,
        base,
        sepolia,
    ],
    ssr: true,
});
