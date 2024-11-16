'use client'

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InfoIcon } from 'lucide-react'
import Image from 'next/image'
import { useVerificationStore } from '@/stores/verification-store'

const assets = [
    { 
      symbol: 'USDC', 
      available: '6,673.67', 
      value: '6,673.27', 
      apy: '1.00', 
      icon: '/tokens/usdc.png',
    },
  ]

export function LoanInterface() {
  const { isVerified } = useVerificationStore()

  const handleBorrow = () => {
    if (!isVerified) {
      alert('Please verify with World ID first')
      return
    }
    // Proceed with borrow transaction
    console.log('Proceeding with borrow...')
  }

  const handleRepay = () => {
    if (!isVerified) {
      alert('Please verify with World ID first')
      return
    }
    // Proceed with repay transaction
    console.log('Proceeding with repay...')
  }

  return (
    <div className="space-y-8">
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
                    className={`w-full ${!isVerified ? 'opacity-50 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                    onClick={handleBorrow}
                    disabled={!isVerified}
                  >
                    {!isVerified ? 'Verify First' : 'Borrow'}
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
              <span className="text-4xl font-bold text-white">$1000.00</span>
              <span className="text-xl text-gray-400">USDC</span>
            </div>
          </div>
          <Button 
            variant="secondary" 
            className={`${!isVerified ? 'opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white px-12 py-6 text-xl rounded-xl`}
            onClick={handleRepay}
            disabled={!isVerified}
          >
            {!isVerified ? 'Verify First' : 'Repay'}
          </Button>
        </div>
      </div>
    </div>
  )
}