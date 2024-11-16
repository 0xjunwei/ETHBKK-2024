'use client'

import { useState } from 'react'
import { IDKitWidget, ISuccessResult, } from '@worldcoin/idkit'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function WorldIDVerification() {
  const [verificationResult, setVerificationResult] = useState<ISuccessResult | null>(null)
  const [error, setError] = useState<string>('')

  const verifyProof = async (proof: ISuccessResult) => {
    try {
      console.log('Sending verification request:', proof)
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merkle_root: proof.merkle_root,
          nullifier_hash: proof.nullifier_hash,
          proof: proof.proof,
          verification_level: "orb"
        }),
      })

      const data = await response.json()
      console.log('Verification response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      console.log('Verification successful:', data)
      return data
    } catch (err) {
      console.error('Error during verification:', err)
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.')
      throw err
    }
  }

  const onSuccess = (result: ISuccessResult) => {
    setVerificationResult(result)
    console.log('Proof received:', result)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>World ID Verification (Staging)</CardTitle>
        <CardDescription>Verify your identity using World ID Simulator</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <IDKitWidget
          app_id={process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID || ""}
          action="testing"
          signal="my_signal"
          verification_level="orb"
          onSuccess={onSuccess}
          handleVerify={verifyProof}
          enableTelemetry={false}
        >
          {({ open }) => (
            <Button onClick={open} variant="outline">
              {verificationResult ? 'Verified ✓' : 'Verify with World ID'}
            </Button>
          )}
        </IDKitWidget>

        {verificationResult && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-mono text-sm break-all">
              Nullifier hash: {verificationResult.nullifier_hash}
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}