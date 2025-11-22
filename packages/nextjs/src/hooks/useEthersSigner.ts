import { useMemo } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { useWalletClient } from 'wagmi';
import type { Account, Chain, Client, Transport } from 'viem';
import { Config, useConnectorClient } from 'wagmi';

export function clientToSigner(client: any) {
    const { account, chain, transport } = client;
    if (!chain) return undefined;
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    };
    const provider = new BrowserProvider(transport, network);
    const signer = new JsonRpcSigner(provider, account.address);
    return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
    const { data: client } = useConnectorClient<Config>({ chainId });
    return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}
