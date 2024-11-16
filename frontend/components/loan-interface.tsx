'use client'

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InfoIcon, CalendarIcon, ClockIcon } from 'lucide-react'
import Image from 'next/image'
import { useVerificationStore } from '@/stores/verification-store'
import { useEffect, useState } from 'react'
import { formatUnits } from 'ethers'
import { ethers } from 'ethers'
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

const getNetwork = () => {
    if (typeof window === 'undefined') return 'unknown'
    
    const ethereum = (window as any).ethereum
    if (!ethereum) return 'unknown'
    
    // Check for zircuit network ID (assuming it's 9990)
    const chainId = ethereum.chainId
    return chainId === '0xbf03' ? 'zircuit' : 'other'
    
}

const getCurrentAddresses = () => {
    const network = getNetwork()
    if (network === 'zircuit') {
        return {
            contractAddress: '0x306D4805CfBEF177C06800AEd812d1f71cE14D2D',
            usdcAddress: '0xf52124E0BF97F20f944D45d475B735E831Cd1575'
        }
    }
    return {
        contractAddress: process.env.NEXT_PUBLIC_DEPLOYER_CONTRACT_ADDRESS,
        usdcAddress: process.env.NEXT_PUBLIC_USDC_ADDRESS
    }
}

const { contractAddress } = getCurrentAddresses()
if (!contractAddress) {
    throw new Error('Contract address not found for this network')
}

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
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_borrowerAddress", "type": "address"},
      {"internalType": "uint256", "name": "_amountToBorrow", "type": "uint256"}
    ],
    "name": "borrowFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_amount", "type": "uint256"}
    ],
    "name": "repayLoans",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const USDC_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

export function LoanInterface() {
  const { isVerified } = useVerificationStore()
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBorrowing, setIsBorrowing] = useState(false)
  const [borrowAmount, setBorrowAmount] = useState('')
  const [borrowError, setBorrowError] = useState<string | null>(null)
  const [isRepaying, setIsRepaying] = useState(false)
  const [repayAmount, setRepayAmount] = useState('')
  const [repayError, setRepayError] = useState<string | null>(null)
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false)
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false)
  const [assets, setAssets] = useState([
    { 
      symbol: 'USDC', 
      available: '0', 
      value: '1.00', 
      apy: '1.00', 
      icon: '/tokens/usdc.png',
    },
  ])
  const { toast } = useToast()

  // Move fetchAccountData outside useEffect but inside component
  const fetchAccountData = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        
        console.log('Fetching account data. Verification status:', { isVerified })
        
        const signer = await provider.getSigner()
        const signerAddress = await signer.getAddress()
        
        if (!contractAddress) {
            throw new Error('Contract address is undefined')
        }
        const contract = new ethers.Contract(contractAddress, abi, provider)
        
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

  // Add this function to fetch USDC balance
  const fetchUSDCBalance = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const { usdcAddress, contractAddress } = getCurrentAddresses()
        if (!usdcAddress) throw new Error('USDC address not found')
            
        const provider = new ethers.BrowserProvider(window.ethereum)
        const usdcContract = new ethers.Contract(usdcAddress, USDC_ABI, provider)
        const balance = await usdcContract.balanceOf(contractAddress)
        console.log("balance is", balance)
        
        setAssets(prev => [{
          ...prev[0],
          available: formatUnits(balance, 6)
        }])
      }
    } catch (error) {
      console.error('Error fetching USDC balance:', error)
    }
  }

  // Use fetchAccountData in useEffect
  useEffect(() => {
    fetchAccountData()
    fetchUSDCBalance()
    
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        fetchAccountData()
        fetchUSDCBalance()
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', fetchAccountData)
      }
    }
  }, [isVerified])

  const dueDate = accountData?.statementDate && accountData.statementDate > BigInt(0)
    ? new Date(Number(accountData.statementDate.toString()) * 1000)
    : new Date(1734366792 * 1000) // Fallback to your expected timestamp
    
  const today = new Date()
  const timeDiff = dueDate.getTime() - today.getTime()
  const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
  const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  // Now handleBorrow can access fetchAccountData
  const handleBorrow = async () => {
    if (!isVerified) {
      console.log('Please verify with World ID first')
      return
    }

    if (!validateBorrowAmount(borrowAmount)) {
      return
    }

    try {
      setIsBorrowing(true)
      console.log('Initiating borrow transaction...')

      if (typeof window.ethereum === 'undefined') {
        throw new Error('Ethereum provider not found')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)

      if (!contractAddress) {
        throw new Error('Contract address not found')
      }
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(contractAddress, abi, signer)

      // Convert the borrow amount from the assets array 
      const borrowAmountInWei = ethers.parseUnits(borrowAmount, 6)
      const borrowerAddress = await signer.getAddress()

      console.log('Borrow parameters:', {
        borrowerAddress,
        borrowAmount: borrowAmountInWei.toString(),
        contractAddress: contractAddress
      })

      const tx = await contract.borrowFunds(borrowerAddress, borrowAmountInWei)
      console.log('Borrow transaction submitted:', tx.hash)

      // Wait for transaction confirmation
      const receipt = await tx.wait()
      console.log('Borrow transaction confirmed:', receipt)

      // Add success toast
      toast({
        title: "Borrow Successful!",
        description: `Successfully borrowed ${borrowAmount} USDC`,
        variant: "default",
        className: "bg-green-800 border-green-900 text-gray-200",
        duration: 3000,
      })

      await fetchAccountData()
      setIsBorrowModalOpen(false)
      setBorrowAmount('')

    } catch (error) {
      console.error('Error during borrow:', error)
      setBorrowError('Transaction failed. Please try again.')
      
      // Add error toast
      toast({
        title: "Borrow Failed",
        description: error instanceof Error ? error.message : "Failed to borrow USDC. Please try again.",
        variant: "destructive",
        className: "bg-red-900 border-red-800 text-gray-200",
        duration: 5000,
        action: (
            <ToastAction 
              altText="Dismiss" 
              className="text-gray-200 hover:text-gray-100"
            >
              Dismiss
            </ToastAction>
          ),
        })
    } finally {
      setIsBorrowing(false)
    }
  }

  const handleRepay = async () => {
    if (!isVerified) {
      console.log('Please verify with World ID first')
      return
    }

    try {
      setIsRepaying(true)
      setRepayError(null)

      if (typeof window.ethereum === 'undefined') {
        throw new Error('Ethereum provider not found')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Get USDC contract instance
      if (!contractAddress) {
        throw new Error('Contract address not found')
      }

      const { usdcAddress } = getCurrentAddresses()
      if (!usdcAddress) throw new Error('USDC address not found')

      const usdcContract = new ethers.Contract(usdcAddress, USDC_ABI, signer)
      const loanContract = new ethers.Contract(contractAddress, abi, signer)

      // Convert the repay amount to USDC's 6 decimals
      const repayAmountInWei = ethers.parseUnits(repayAmount, 6)

      // First approve the loan contract to spend USDC
      console.log('Approving USDC spend...')
      const approveTx = await usdcContract.approve(contractAddress, repayAmountInWei)
      await approveTx.wait()
      console.log('USDC spend approved')

      // Now call repay
      const tx = await loanContract.repayLoans(repayAmountInWei)
      console.log('Repay transaction submitted:', tx.hash)

      const receipt = await tx.wait()
      console.log('Repay transaction confirmed:', receipt)

      // Add success toast
      toast({
        title: "Repayment Successful!",
        description: `Successfully repaid ${repayAmount} USDC`,
        variant: "default",
        className: "bg-green-800 border-green-900 text-gray-200",
        duration: 3000,
        action: (
          <ToastAction altText="View transaction" onClick={() => window.open(`https://sepolia.etherscan.io/tx/${receipt.hash}`, '_blank')}>
            View transaction
          </ToastAction>
        ),
      })

      await fetchAccountData()
      setIsRepayModalOpen(false)
      setRepayAmount('')
    } catch (error) {
      console.error('Error during repay:', error)
      setRepayError('Transaction failed. Please try again.')
      
      // Add error toast
      toast({
        title: "Repayment Failed",
        description: error instanceof Error 
          ? error.message 
          : "Failed to repay USDC. Please check your balance and try again.",
        variant: "destructive",
        className: "bg-red-900 border-red-800 text-gray-200",
        duration: 5000,
        action: (
          <ToastAction 
            altText="Dismiss" 
            className="text-gray-200 hover:text-gray-100"
          >
            Dismiss
          </ToastAction>
        ),
      })
    } finally {
      setIsRepaying(false)
    }
  }

  const validateBorrowAmount = (amount: string) => {
    setBorrowError(null)
    if (!accountData) return false
    
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setBorrowError('Please enter a valid amount')
      return false
    }

    const newBorrowAmount = ethers.parseUnits(amount, 6)
    const totalAfterBorrow = newBorrowAmount + accountData.totalBorrowed

    if (totalAfterBorrow > accountData.creditLimit) {
      setBorrowError(`Amount exceeds credit limit. Amount Left: $${
        formatUnits(accountData.creditLimit - accountData.totalBorrowed, 6)
      } USDC`)
      return false
    }

    return true
  }

  return (
    <div className="space-y-8">
      <div className="w-full overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="border-b border-gray-700">
              <TableHead className="text-xl text-gray-400 font-medium w-[200px]">Asset</TableHead>
              <TableHead className="text-xl text-gray-400 font-medium w-[250px]">
                <div className="flex items-center gap-2">
                  Available 
                </div>
              </TableHead>
              <TableHead className="text-xl text-gray-400 font-medium w-[200px]">
                <div className="flex flex-col">
                  <span>Interest Rate</span>
                  <span className="text-sm text-gray-400">Aft Due (1 Time)</span>
                </div>
              </TableHead>
              <TableHead className="w-[250px]"></TableHead>
              <TableHead className="w-[100px]"></TableHead>
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
                <TableCell className="py-6 w-[250px]">
                  <div className="text-2xl font-medium text-white">{asset.available}</div>
                  <div className="text-gray-400">${asset.value}</div>
                </TableCell>
                <TableCell className="!text-gray text-2xl py-6 w-[250px]">
                  <div className="flex items-center justify-center">
                    {asset.apy}%
                  </div>
                </TableCell>
                <TableCell className="py-6 w-[250px]">
                  <Dialog open={isBorrowModalOpen} onOpenChange={setIsBorrowModalOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="secondary" 
                        className={`w-full ${
                          isVerified 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'bg-gray-700 hover:bg-gray-600'
                        } text-white text-sm py-2`}
                        disabled={!isVerified}
                      >
                        {isVerified ? 'Borrow' : 'Verify First'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-medium text-gray-300">Borrow Funds</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Amount to Borrow</label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              value={borrowAmount}
                              onChange={(e) => setBorrowAmount(e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white"
                              disabled={isBorrowing}
                            />
                            <span className="text-gray-400">USDC</span>
                          </div>
                          {borrowError && (
                            <p className="text-red-400 text-sm">{borrowError}</p>
                          )}
                        </div>
                        <Button 
                          variant="secondary" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={handleBorrow}
                          disabled={isBorrowing || !borrowAmount || parseFloat(borrowAmount) <= 0}
                        >
                          {isBorrowing ? 'Processing...' : 'Confirm Borrow'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-medium text-gray-300 mb-2">Your Debt</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-white">
                ${accountData?.totalDue ? formatUnits(accountData.totalDue, 6) : '0.00'}
              </span>
              <span className="text-xl text-gray-400">USDC</span>
            </div>
          </div>
          
          <Dialog open={isRepayModalOpen} onOpenChange={setIsRepayModalOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="secondary" 
                className={`${
                  isVerified 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                } text-white px-8 py-4 text-lg rounded-xl`}
                disabled={!isVerified || !accountData?.totalDue || accountData.totalDue === BigInt(0)}
              >
                {isVerified ? 'Repay' : 'Verify First'}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-xl font-medium text-gray-300">Repay Loan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Amount to Repay</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={repayAmount}
                      onChange={(e) => setRepayAmount(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      disabled={isRepaying}
                    />
                    <span className="text-gray-400">USDC</span>
                  </div>
                  {repayError && (
                    <p className="text-red-400 text-sm">{repayError}</p>
                  )}
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleRepay}
                  disabled={isRepaying || !repayAmount || parseFloat(repayAmount) <= 0}
                >
                  {isRepaying ? 'Processing...' : 'Confirm Repayment'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {accountData && accountData.totalDue > BigInt(0) && (
        <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
          <h3 className="text-2xl font-medium text-gray-300 mb-2">Loan Due Date</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div>
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
                  {daysLeft} days and {hoursLeft} hours remaining until due date
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
          <h3 className="text-2xl font-medium text-gray-300 mb-4">Account Details</h3>
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
              <p className="text-white text-xl">
              ${accountData.lateFee === BigInt(1) || accountData.lateFee === BigInt(0)
                ? '0.00'
                : formatUnits(accountData.lateFee, 6)
                } USDC
              </p>
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
    </div>
  )
}