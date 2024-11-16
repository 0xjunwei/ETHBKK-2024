'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SwapInterface } from '@/components/swap-interface'
import { Navbar } from '@/components/navbar'
import { motion, useAnimation } from 'framer-motion'

export default function Home() {
  const controls = useAnimation()

  useEffect(() => {
    controls.start(i => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2 }
    }))
  }, [controls])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <motion.section 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          custom={0}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Uncollateralized DeFi Loans
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Mo Tokens. Mo Problems. Verify and take a loan on a swap.
          </p>
        </motion.section>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            custom={1}
          >
            <Card className="w-full bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Swap Tokens</CardTitle>
                <CardDescription className="text-gray-400">Exchange tokens with our built-in swap feature</CardDescription>
              </CardHeader>
              <CardContent>
                <SwapInterface />
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              custom={2}
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Why Choose LimpehFi?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Undercollateralized loans</li>
                    <li>Integrated token swapping</li>
                    <li>Secure identity verification</li>
                    <li>Competitive interest rates</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              custom={3}
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Get Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">Ready to dive into the world of uncollateralized DeFi loans? Follow these steps:</p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>Connect your wallet</li>
                    <li>Verify your identity with World ID</li>
                    <li>Swap tokens or apply for a loan</li>
                    <li>Enjoy the benefits of LimpehFi</li>
                  </ol>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="mt-16 bg-gray-800 py-6 text-center">
        <p className="text-sm text-gray-400">&copy; 2023 LimpehFi. All rights reserved.</p>
      </footer>
    </div>
  )
}