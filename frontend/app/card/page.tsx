'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Snowflake, Key, Shield, DollarSign, MoreVertical, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from '@/components/navbar'

export default function Component() {
  const [isCardFrozen, setIsCardFrozen] = useState(false)
  const [activeCard, setActiveCard] = useState(0)

  const cards = [
    { 
      name: 'Main Card', 
      number: '5306 3800 2331 5043', 
      validThru: '11/29', 
      cvv: '121',
      gradient: 'from-blue-500 to-purple-600'
    },
    { 
      name: 'Secondary Card', 
      number: '4321 8765 1234 5678', 
      validThru: '12/25', 
      cvv: '345',
      gradient: 'from-emerald-500 to-teal-600'
    },
    { 
      name: 'Business Card', 
      number: '9876 5432 1098 7654', 
      validThru: '09/26', 
      cvv: '567',
      gradient: 'from-pink-500 to-rose-600'
    },
  ]

  const nextCard = () => {
    setActiveCard((prev) => (prev + 1) % cards.length)
  }

  const prevCard = () => {
    setActiveCard((prev) => (prev - 1 + cards.length) % cards.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 md:py-12">
        <Card className="w-full bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">LimpehFi cards</h1>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="relative flex items-center justify-center min-h-[220px]">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevCard}
                className="absolute left-0 z-10 text-white hover:bg-gray-700/50"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>

              <div className="relative w-[400px] h-[220px]">
                {cards.map((card, index) => (
                  <div
                    key={index}
                    className={`absolute top-0 left-0 w-full transition-all duration-300 transform ${
                      index === activeCard 
                        ? 'scale-100 opacity-100 translate-x-0' 
                        : index === activeCard - 1
                        ? 'scale-90 opacity-50 -translate-x-full'
                        : index === activeCard + 1
                        ? 'scale-90 opacity-50 translate-x-full'
                        : 'scale-75 opacity-0'
                    }`}
                  >
                    <div className={`bg-gradient-to-br ${card.gradient} rounded-2xl transform transition-transform hover:scale-105 cursor-pointer`}>
                      <div className="p-6 flex flex-col justify-between h-[220px] text-white">
                        <div className="flex justify-between items-start">
                          <span className="font-medium">{card.name}</span>
                          <Button variant="ghost" size="icon" className="text-white -mt-2 -mr-2">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </div>
                        
                        <div>
                          <div className="mb-4 tracking-wider text-lg">
                            {card.number.split(' ').map((group, i) => (
                              <span key={i} className="mr-4">{group}</span>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-end">
                            <div className="space-y-1">
                              <div className="text-xs opacity-75">VALID THRU</div>
                              <div>{card.validThru}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs opacity-75">CVV</div>
                              <div>{card.cvv}</div>
                            </div>
                            <div className="flex space-x-2">
                              <div className="w-8 h-8 rounded-full bg-red-500 opacity-80" />
                              <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-80" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextCard}
                className="absolute right-0 z-10 text-white hover:bg-gray-700/50"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>

            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start text-left bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                onClick={() => setIsCardFrozen(!isCardFrozen)}
              >
                <Snowflake className="mr-3 h-5 w-5 text-blue-400" />
                <div>
                  <div className="font-medium">{isCardFrozen ? 'Unfreeze card' : 'Freeze card'}</div>
                  <div className="text-sm text-gray-400">
                    {isCardFrozen ? 'Tap again to unfreeze' : 'Temporarily disable card'}
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start text-left bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
              >
                <Key className="mr-3 h-5 w-5 text-blue-400" />
                <div>
                  <div className="font-medium">View PIN</div>
                  <div className="text-sm text-gray-400">Always protect your PIN</div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start text-left bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
              >
                <Shield className="mr-3 h-5 w-5 text-blue-400" />
                <div>
                  <div className="font-medium">Security</div>
                  <div className="text-sm text-gray-400">Enable additional protection</div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-start text-left bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
              >
                <DollarSign className="mr-3 h-5 w-5 text-blue-400" />
                <div>
                  <div className="font-medium">Limit</div>
                  <div className="text-sm text-gray-400">Set monthly spending amount</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}