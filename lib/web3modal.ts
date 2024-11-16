import { defaultWagmiConfig } from '@web3modal/ethereum'
import { createWeb3Modal } from '@web3modal/react'

// Get projectId at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!

const metadata = {
  name: 'LimpehFi',
  description: 'Uncollateralized DeFi Loans',
  url: 'https://limpehfi.com', // Update with your website
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const web3modal = createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'Inter, sans-serif',
    '--w3m-accent-color': '#3b82f6' // blue-500
  }
}) 