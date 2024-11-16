'use client'

import { projectId, queryClient } from '@/lib/wagmi'
import { QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, unichainSepolia } from 'wagmi/chains'

const config = getDefaultConfig({
  appName: 'LimpehFi',
  projectId: projectId,
  chains: [mainnet, unichainSepolia],
  ssr: true, // For NextJS
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
    return (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    )
}