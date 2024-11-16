import '@rainbow-me/rainbowkit/styles.css'
// import { mainnet, scrollSepolia } from 'wagmi/chains'
import { QueryClient } from '@tanstack/react-query'

if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID')
}

export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
export const queryClient = new QueryClient()