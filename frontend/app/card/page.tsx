'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Snowflake, Key, Shield, DollarSign, MoreVertical, Plus } from 'lucide-react'

export default function Component() {
  const [isCardFrozen, setIsCardFrozen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">LimpehFi cards</h1>
          <Button variant="ghost" size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl transform transition-transform hover:scale-105 cursor-pointer">
            <div className="p-6 h-full flex flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <span className="font-medium">Main Card</span>
                <Button variant="ghost" size="icon" className="text-white -mt-2 -mr-2">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
              
              <div>
                <div className="mb-4 tracking-wider text-lg">
                  <span className="mr-4">5306</span>
                  <span className="mr-4">3800</span>
                  <span className="mr-4">2331</span>
                  <span>5043</span>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-xs opacity-75">VALID THRU</div>
                    <div>11/29</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs opacity-75">CVV</div>
                    <div>121</div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 rounded-full bg-red-500 opacity-80" />
                    <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-[56.25%]" />
        </div>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => setIsCardFrozen(!isCardFrozen)}
          >
            <Snowflake className="mr-3 h-5 w-5 text-blue-500" />
            <div>
              <div className="font-medium">{isCardFrozen ? 'Unfreeze card' : 'Freeze card'}</div>
              <div className="text-sm text-gray-500">
                {isCardFrozen ? 'Tap again to unfreeze' : 'Temporarily disable card'}
              </div>
            </div>
          </Button>

          <Button variant="outline" className="w-full justify-start text-left">
            <Key className="mr-3 h-5 w-5 text-blue-500" />
            <div>
              <div className="font-medium">View PIN</div>
              <div className="text-sm text-gray-500">Always protect your PIN</div>
            </div>
          </Button>

          <Button variant="outline" className="w-full justify-start text-left">
            <Shield className="mr-3 h-5 w-5 text-blue-500" />
            <div>
              <div className="font-medium">Security</div>
              <div className="text-sm text-gray-500">Enable additional protection</div>
            </div>
          </Button>

          <Button variant="outline" className="w-full justify-start text-left">
            <DollarSign className="mr-3 h-5 w-5 text-blue-500" />
            <div>
              <div className="font-medium">Limit</div>
              <div className="text-sm text-gray-500">Set monthly spending amount</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}