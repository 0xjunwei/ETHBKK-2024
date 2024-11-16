import { NextResponse } from 'next/server'

const WORLDCOIN_APP_ID = process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID
const WORLDCOIN_ACTION = process.env.NEXT_PUBLIC_WORLDCOIN_ACTION
const WORLDCOIN_API_BASE_URL = process.env.NEXT_PUBLIC_WORLDCOIN_API_BASE_URL

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Received verification request:', body)

    const verifyRes = await fetch(`${WORLDCOIN_API_BASE_URL}/verify/${WORLDCOIN_APP_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: WORLDCOIN_ACTION,
        signal: body.signal || "my_signal",
        proof: body.proof,
        nullifier_hash: body.nullifier_hash,
        merkle_root: body.merkle_root,
        verification_level: "orb"
      }),
    })

    const verifyData = await verifyRes.json()
    console.log('World ID API response:', verifyData)

    if (verifyRes.ok && verifyData.success) {
      console.log('Proof verified successfully!')
      return NextResponse.json({ success: true, data: verifyData })
    } else {
      console.error('Proof verification failed:', verifyData)
      return NextResponse.json({ success: false, error: verifyData.detail || 'Invalid proof' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error during proof verification:', error)
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 })
  }
}