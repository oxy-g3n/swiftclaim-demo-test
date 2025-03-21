'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24">
      <div className="z-10 max-w-5xl w-full flex flex-col items-center justify-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold text-center">
          <span className="text-blue-600">SwiftClaim</span>
        </h1>
        <p className="text-xl md:text-2xl text-center max-w-3xl">
          Revolutionizing Insurance Claims with AI & Blockchain: Faster, Smarter, Fraud-Proof
        </p>
        
        <div className="p-6 bg-white shadow-lg rounded-xl max-w-3xl w-full">
          <h2 className="text-2xl font-bold mb-4">Demo Experience</h2>
          <p className="mb-4">
            This demo showcases our instant claim processing system for flight insurance. Experience how claims are processed automatically when flights are delayed or cancelled.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            <div className="flex flex-col space-y-2 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">For Customers</h3>
              <p>Purchase flight insurance and receive instant payouts for delays.</p>
              <Link href="/customer-dashboard" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-center hover:bg-blue-700 transition-colors">
                Customer Dashboard
              </Link>
            </div>
            
            <div className="flex flex-col space-y-2 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold">For Insurers</h3>
              <p>Monitor policy creation and automated claim processing.</p>
              <Link href="/insurer-dashboard" className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md text-center hover:bg-green-700 transition-colors">
                Insurer Dashboard
              </Link>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">How it works</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Purchase a travel insurance policy for your flight</li>
              <li>Our system monitors flight status in real-time</li>
              <li>If your flight is delayed or cancelled, a claim is automatically initiated</li>
              <li>Smart contracts verify the claim and process the payout instantly</li>
              <li>Funds are transferred to your account within minutes</li>
            </ol>
          </div>
          
          <div className="mt-6 text-center">
            <Link href="/blockchain-status" className="text-blue-600 hover:underline">
              Check Blockchain Integration Status →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
} 