import { useMemo } from 'react';
import { FallbackProvider, JsonRpcProvider } from 'ethers';
import { usePublicClient } from 'wagmi';
import type { Client, Chain, Transport } from 'viem';

export function publicClientToProvider(client: Client<Transport, Chain>) {
    const { chain, transport } = client;
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    };
    if (transport.type === 'fallback') {
        const providers = (transport.transports as ReturnType<Transport>[]).map(
            ({ value }) => new JsonRpcProvider(value?.url, network),
        );
        if (providers.length === 1) return providers[0];
        return new FallbackProvider(providers);
    }
    return new JsonRpcProvider(transport.url, network);
}

/** Hook to convert a viem Public Client to an ethers.js Provider. */
export function useEthersProvider({ chainId }: { chainId?: number } = {}) {
    const publicClient = usePublicClient({ chainId });
    return useMemo(
        () => (publicClient ? publicClientToProvider(publicClient) : undefined),
        [publicClient],
    );
}
