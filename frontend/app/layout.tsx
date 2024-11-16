// Remove this import if it exists:
// import { chains } from '@/lib/wagmi'

// Instead, import only what you need:
import { Web3Provider } from '@/components/web3-provider'
import './globals.css'  // Your global styles

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}