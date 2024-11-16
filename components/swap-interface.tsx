'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownUp } from 'lucide-react'
import { motion } from 'framer-motion'

export function SwapInterface() {
  const [fromToken, setFromToken] = useState('ETH')
  const [toToken, setToToken] = useState('USDC')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')

  const handleSwap = () => {
    // Implement swap logic here
    console.log('Swap initiated:', { fromToken, toToken, fromAmount, toAmount })
  }

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">From</label>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="0.0"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className="flex-grow bg-gray-700 text-white border-gray-600 focus:border-blue-400"
          />
          <Select value={fromToken} onValueChange={setFromToken}>
            <SelectTrigger className="w-[120px] bg-gray-700 text-white border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white border-gray-600">
              <SelectItem value="ETH">ETH</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="DAI">DAI</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="w-full text-gray-300 hover:text-white hover:bg-gray-700"
        onClick={() => {
          setFromToken(toToken)
          setToToken(fromToken)
          setFromAmount(toAmount)
          setToAmount(fromAmount)
        }}
      >
        <ArrowDownUp className="h-4 w-4" />
      </Button>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">To</label>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="0.0"
            value={toAmount}
            onChange={(e) => setToAmount(e.target.value)}
            className="flex-grow bg-gray-700 text-white border-gray-600 focus:border-blue-400"
          />
          <Select value={toToken} onValueChange={setToToken}>
            <SelectTrigger className="w-[120px] bg-gray-700 text-white border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 text-white border-gray-600">
              <SelectItem value="ETH">ETH</SelectItem>
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="DAI">DAI</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={handleSwap}>Swap</Button>
    </motion.div>
  )
}