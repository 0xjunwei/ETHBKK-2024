import '@rainbow-me/rainbowkit/styles.css'
import {
  getDefaultConfig,
} from '@rainbow-me/rainbowkit'
import { mainnet, unichainSepolia } from 'wagmi/chains'

if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID')
}

export const config = getDefaultConfig({
  appName: 'LimpehFi',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  chains: [mainnet, unichainSepolia],
  ssr: true, // For NextJS
})

export const chains = [mainnet, unichainSepolia]