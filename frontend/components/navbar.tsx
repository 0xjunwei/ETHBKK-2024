'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { IDKitWidget, ISuccessResult } from '@worldcoin/idkit'
import { motion } from 'framer-motion'
import { useVerificationStore } from '@/stores/verification-store'
import { WalletConnect } from '@/components/wallet-connect'

export function Navbar() {
  const { isVerified, setIsVerified } = useVerificationStore()

  const verifyProof = async (proof: ISuccessResult) => {
    try {
      // Implement your verification logic here
      console.log('Proof received:', proof)
      setIsVerified(true)
    } catch (error) {
      console.error('Verification failed:', error)
      throw error
    }
  }

  const onSuccess = (result: ISuccessResult) => {
    console.log('Verification successful:', result)
    setIsVerified(true)
  }

  return (
    <motion.header 
      className="bg-gray-800 p-4 md:p-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white">
          <span className="text-blue-400">Limpeh</span>
          <span className="text-purple-400">Fi</span>
        </Link>
        <div className="space-x-4 flex items-center">
          <Button variant="ghost" asChild>
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
          </Button>
          <IDKitWidget
            app_id="app_staging_1b1bcbd424e6b9865f37e0c581b173e0"
            action="verify"
            signal="my_signal"
            onSuccess={onSuccess}
            handleVerify={verifyProof}
          >
            {({ open }) => (
              <Button 
                variant="outline" 
                onClick={open} 
                className={`transition-colors ${isVerified ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
              >
                {isVerified ? 'Verified ✓' : 'Verify with World ID'}
              </Button>
            )}
          </IDKitWidget>
          <WalletConnect className="bg-blue-500 hover:bg-blue-600 text-white transition-colors" />
        </div>
      </nav>
    </motion.header>
  )
}