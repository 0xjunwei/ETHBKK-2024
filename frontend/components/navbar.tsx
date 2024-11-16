'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { IDKitWidget, ISuccessResult } from '@worldcoin/idkit'
import { motion } from 'framer-motion'
import { ethers } from 'ethers'
import { useVerificationStore } from '@/stores/verification-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, LogOut } from 'lucide-react'

export function Navbar() {
  const { isVerified, setIsVerified } = useVerificationStore()
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)

  useEffect(() => {
    checkConnection()
    window.ethereum?.on('accountsChanged', checkConnection)
    window.ethereum?.on('chainChanged', checkConnection)
    return () => {
      window.ethereum?.removeListener('accountsChanged', checkConnection)
      window.ethereum?.removeListener('chainChanged', checkConnection)
    }
  }, [])

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        setChainId(Number(network.chainId))
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          setIsConnected(true)
          setAddress(accounts[0].address)
        } else {
          setIsConnected(false)
          setAddress(null)
        }
      } catch (error) {
        console.error('Error checking connection:', error)
        setIsConnected(false)
        setAddress(null)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        await provider.send('eth_requestAccounts', [])
        checkConnection()
      } catch (error) {
        console.error('Error connecting wallet:', error)
      }
    } else {
      alert('Please install MetaMask or another Ethereum wallet')
    }
  }

  const switchNetwork = async (networkId: number) => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${networkId.toString(16)}` }],
        })
      } catch (error: any) {
        if (error.code === 4902) {
          // Network not added, you might want to add it here
          console.log('Network not added to wallet')
        } else {
          console.error('Error switching network:', error)
        }
      }
    }
  }

  const verifyProof = async (proof: ISuccessResult) => {
    console.log('Proof received:', proof)
    setIsVerified(true)
  }

  const onSuccess = (result: ISuccessResult) => {
    console.log('Verification successful:', result)
    setIsVerified(true)
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress(null)
    setChainId(null)
  }

  const networks = [
    { id: 48899, name: 'Zircuit' },
    { id: 534351, name: 'Scroll Sepolia' },
  ]

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
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
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
          {isConnected ? (
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="text-gray-300">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] bg-gray-800 border-gray-700">
                  <DropdownMenuItem
                    onClick={disconnectWallet}
                    className="text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="text-gray-300">
                    Switch Network
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px] bg-gray-800 border-gray-700">
                  {networks.map((network) => (
                    <DropdownMenuItem
                      key={network.id}
                      onClick={() => switchNetwork(network.id)}
                      className={`cursor-pointer ${
                        chainId === network.id 
                          ? 'text-blue-400 hover:text-blue-300' 
                          : 'text-gray-300 hover:text-white'
                      }`}
                    >
                      {chainId === network.id ? `✓ ${network.name}` : network.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button 
              onClick={connectWallet} 
              className="bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </nav>
    </motion.header>
  )
}