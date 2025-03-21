'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'

export default function BlockchainStatus() {
  const [status, setStatus] = useState<{
    status: string
    database: string
    blockchain: string
    contract: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
        setStatus(response.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch blockchain status')
        setLoading(false)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 5000) // Check every 5 seconds
    
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Blockchain Status</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Back to Home
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        {loading ? (
          <p>Loading status...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : status ? (
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="font-semibold w-32">API Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                status.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {status.status}
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="font-semibold w-32">Database:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                status.database === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {status.database}
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="font-semibold w-32">Blockchain:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                status.blockchain === 'connected' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status.blockchain}
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="font-semibold w-32">Smart Contract:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                status.contract === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status.contract}
              </span>
            </div>

            {status.blockchain === 'disconnected' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h3 className="text-lg font-semibold text-yellow-800">Blockchain Not Connected</h3>
                <p className="text-yellow-700">
                  The demo is running in fallback mode. To use blockchain integration:
                </p>
                <ol className="list-decimal list-inside mt-2 ml-2 text-yellow-700">
                  <li>Make sure Hardhat node is running (npx hardhat node)</li>
                  <li>Deploy the contract (npx hardhat run scripts/deploy.js --network localhost)</li>
                  <li>Update CONTRACT_ADDRESS in backend/.env</li>
                  <li>Restart the backend server</li>
                </ol>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">How Blockchain Integration Works</h3>
          <p className="mb-4">
            This demo now attempts to connect to your local Hardhat node and call contract functions.
            If the blockchain connection is available, the backend will use <code>callStatic</code> to
            verify the contract methods would work, without actually sending transactions.
          </p>
          <p>
            This approach tests contract connectivity while still simulating the actual transaction part.
            You can see when the backend connects to the blockchain in the server console logs.
          </p>
        </div>
      </div>
    </main>
  )
} 