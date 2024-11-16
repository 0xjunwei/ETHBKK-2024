import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { projectId} from './wagmi'
import { mainnet, scrollSepolia, zircuitTestnet } from 'wagmi/chains'

const metadata = {
  name: 'LimpehFi',
  description: 'Uncollateralized DeFi Loans',
  url: 'https://limpehfi.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create wagmi config
const config = defaultWagmiConfig({
  chains: [mainnet, scrollSepolia, zircuitTestnet],
  projectId,
  metadata
})

// Create modal
export const web3modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'Inter, sans-serif',
    '--w3m-accent': '#3b82f6' // blue-500
  }
}) 