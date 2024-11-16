'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

interface WalletConnectProps {
  className?: string;
}

export function WalletConnect({ className }: WalletConnectProps) {
  return (
    <div className={className}>
      <ConnectButton 
        chainStatus="icon"
        showBalance={true}
      />
    </div>
  )
}