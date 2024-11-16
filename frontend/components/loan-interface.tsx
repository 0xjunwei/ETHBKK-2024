'use client'

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InfoIcon, CalendarIcon, ClockIcon } from 'lucide-react'
import Image from 'next/image'
import { useVerificationStore } from '@/stores/verification-store'
import { useEffect, useState } from 'react'
import { formatUnits } from 'ethers'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DEPLOYER_CONTRACT_ADDRESS as string

interface AccountData {
  kyc: string
  creditLimit: bigint
  totalBorrowed: bigint
  totalPaid: bigint
  totalDue: bigint
  statementDate: bigint
  dueDate: bigint
  lateFee: bigint
  isAccountActive: boolean
}

const assets = [
    { 
      symbol: 'USDC', 
      available: '6,673.67', 
      value: '6,673.27', 
      apy: '1.00', 
      icon: '/tokens/usdc.png',
    },
]

const abi = [
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "accounts",
    outputs: [
      { internalType: "string", name: "kyc", type: "string" },
      { internalType: "uint256", name: "creditLimit", type: "uint256" },
      { internalType: "uint256", name: "totalBorrowed", type: "uint256" },
      { internalType: "uint256", name: "totalPaid", type: "uint256" },
      { internalType: "uint256", name: "totalDue", type: "uint256" },
      { internalType: "uint256", name: "statementDate", type: "uint256" },
      { internalType: "uint256", name: "dueDate", type: "uint256" },
      { internalType: "uint256", name: "lateFee", type: "uint256" },
      { internalType: "bool", name: "isAccountActive", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  }
]

export function LoanInterface() {
  const { isVerified } = useVerificationStore()
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add this effect to monitor verification state
  useEffect(() => {
    console.log('LoanInterface - Verification State Changed:', { isVerified })
  }, [isVerified])

  useEffect(() => {
    async function fetchAccountData() {
      try {
        if (typeof window.ethereum !== 'undefined') {
          const provider = new ethers.BrowserProvider(window.ethereum)
          
          // Log verification state when fetching
          console.log('Fetching account data. Verification status:', { isVerified })
          
          const signer = await provider.getSigner()
          const signerAddress = await signer.getAddress()
          
          // Log connection details
          console.log('Debug Info:', {
            contractAddress: CONTRACT_ADDRESS,
            signerAddress: signerAddress,
            abiFragment: abi[0]
          })
          
          const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider)
          
          console.log('Calling accounts function with address:', signerAddress)
          const accountInfo = await contract.accounts(signerAddress)
          console.log('Raw account info:', accountInfo)

          if (!accountInfo) {
            throw new Error('No account data returned from contract')
          }

          const formattedAccountData: AccountData = {
            kyc: accountInfo.kyc,
            creditLimit: accountInfo.creditLimit,
            totalBorrowed: accountInfo.totalBorrowed,
            totalPaid: accountInfo.totalPaid,
            totalDue: accountInfo.totalDue,
            statementDate: accountInfo.statementDate,
            dueDate: accountInfo.dueDate,
            lateFee: accountInfo.lateFee,
            isAccountActive: accountInfo.isAccountActive
          }
          
          console.log('Formatted account data:', formattedAccountData)
          setAccountData(formattedAccountData)
        } else {
          throw new Error('Ethereum provider not found')
        }
      } catch (err) {
        console.error('Contract call failed:', err)

      } finally {
        setIsLoading(false)
      }
    }
    // Initial fetch
    fetchAccountData()

    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        console.log('Network changed, refetching data...')
        fetchAccountData()
      })
    }

    // Cleanup listener
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', fetchAccountData)
      }
    }
  }, [isVerified])


  
  // Convert Unix timestamp to Date object
  const dueDate = accountData?.dueDate ? new Date(Number(accountData.dueDate) * 1000) : new Date()
  const today = new Date()
  const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  const handleBorrow = () => {
    if (!isVerified) {
      console.log('Please verify with World ID first')
      return
    }
    console.log('Borrow clicked - Verified user, proceeding...')
    console.log('Proceeding with borrow...')
  }

  const handleRepay = () => {
    if (!isVerified) {
      console.log('Please verify with World ID first')
      return
    }
    console.log('Repay clicked - Verified user, proceeding...')
    console.log('Proceeding with repay...')
  }

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="text-white">Loading account data...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : accountData ? (
        <>
          <div className="w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-b border-gray-700">
                  <TableHead className="text-xl text-white font-medium w-[200px]">Asset</TableHead>
                  <TableHead className="text-xl text-white font-medium w-[300px]">
                    <div className="flex items-center gap-2">
                      Available 
                      <InfoIcon className="h-5 w-5 cursor-help text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead className="text-xl text-white font-medium w-[300px]">
                    <div className="flex items-center gap-2">
                      Interest Rate Aft Due
                      <InfoIcon className="h-5 w-5 cursor-help text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead className="w-[150px]"></TableHead>
                  <TableHead className="w-[150px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.symbol} className="border-b border-gray-700">
                    <TableCell className="py-6 w-[200px]">
                      <div className="flex items-center gap-3">
                        <Image 
                          src={asset.icon} 
                          alt={asset.symbol} 
                          width={32} 
                          height={32} 
                          className="rounded-full" 
                        />
                        <span className="text-white text-lg">{asset.symbol}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 w-[300px]">
                      <div className="text-2xl font-medium text-white">{asset.available}</div>
                      <div className="text-gray-400">${asset.value}</div>
                    </TableCell>
                    <TableCell className="text-white text-2xl py-6 w-[300px]">{asset.apy}%</TableCell>
                    <TableCell className="py-6 w-[150px]">
                      <Button 
                        variant="secondary" 
                        className={`w-full ${
                          isVerified 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-gray-700 hover:bg-gray-600'
                        } text-white`}
                        onClick={handleBorrow}
                        disabled={!isVerified}
                      >
                        {isVerified ? 'Borrow' : 'Verify First'}
                      </Button>
                    </TableCell>
                    <TableCell className="py-6 w-[150px]">
                      <Button variant="outline" className="w-full border-gray-700 text-gray-400 hover:bg-gray-700">
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-medium text-white mb-2">Your Debt</h3>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-white">
                    ${accountData?.totalDue ? formatUnits(accountData.totalDue, 6) : '0.00'}
                  </span>
                  <span className="text-xl text-gray-400">USDC</span>
                </div>
              </div>
              <Button 
                variant="secondary" 
                className={`${
                  isVerified 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                } text-white px-12 py-6 text-xl rounded-xl`}
                onClick={handleRepay}
                disabled={!isVerified}
              >
                {isVerified ? 'Repay' : 'Verify First'}
              </Button>
            </div>
          </div>

          {accountData && accountData.totalDue > BigInt(0) && (
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-medium text-white mb-2">Loan Due Date</h3>
                    <div className="flex items-center gap-2 text-gray-300">
                      <CalendarIcon className="h-5 w-5" />
                      <span className="text-xl">
                        {dueDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <ClockIcon className="h-5 w-5" />
                    <span className="text-lg">
                      {daysLeft} days remaining until due date
                    </span>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${daysLeft <= 7 ? 'text-red-400' : 'text-green-400'}`}>
                  {daysLeft <= 7 ? 'Due Soon!' : 'On Track'}
                </div>
              </div>
            </div>
          )}

          {accountData && (
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-medium text-white mb-4">Account Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Credit Limit</p>
                  <p className="text-white text-xl">${formatUnits(accountData.creditLimit, 6)} USDC</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Borrowed</p>
                  <p className="text-white text-xl">${formatUnits(accountData.totalBorrowed, 6)} USDC</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Paid</p>
                  <p className="text-white text-xl">${formatUnits(accountData.totalPaid, 6)} USDC</p>
                </div>
                <div>
                  <p className="text-gray-400">Late Fee</p>
                  <p className="text-white text-xl">${formatUnits(accountData.lateFee, 6)} USDC</p>
                </div>
                <div>
                  <p className="text-gray-400">Account Status</p>
                  <p className={`text-xl ${accountData.isAccountActive ? 'text-green-400' : 'text-red-400'}`}>
                    {accountData.isAccountActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-white">No account data available</div>
      )}
    </div>
  )
}