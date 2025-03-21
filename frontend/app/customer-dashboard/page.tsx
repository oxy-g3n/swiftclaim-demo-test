'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService, Policy, Claim, CreatePolicyData } from '../services/api'
import Link from 'next/link'

export default function CustomerDashboard() {
  const queryClient = useQueryClient()
  const [randomWalletAddress] = useState(`0x${Array(40).fill().map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`)
  const [newPolicy, setNewPolicy] = useState<Partial<CreatePolicyData>>({
    userAddress: randomWalletAddress,
    flightNumber: '',
    departureTime: '',
    coverageAmount: 0,
    premium: 0
  })
  
  // Get policies
  const { data: policies, isLoading: isLoadingPolicies } = useQuery<Policy[]>({
    queryKey: ['policies'],
    queryFn: apiService.getPolicies
  })

  // Get claims
  const { data: claims, isLoading: isLoadingClaims } = useQuery<Claim[]>({
    queryKey: ['claims'],
    queryFn: apiService.getClaims
  })
  
  // Create policy mutation
  const createPolicyMutation = useMutation({
    mutationFn: apiService.createPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      setNewPolicy({
        userAddress: randomWalletAddress,
        flightNumber: '',
        departureTime: '',
        coverageAmount: 0,
        premium: 0
      })
    }
  })
  
  // Create claim mutation
  const createClaimMutation = useMutation({
    mutationFn: ({ policyId, data }: { policyId: number, data: any }) => 
      apiService.createClaim(policyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      queryClient.invalidateQueries({ queryKey: ['claims'] })
    }
  })
  
  // Handle form submission
  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!newPolicy.flightNumber || !newPolicy.departureTime || !newPolicy.coverageAmount || !newPolicy.premium) {
      alert('Please fill in all fields')
      return
    }
    
    createPolicyMutation.mutate(newPolicy as CreatePolicyData)
  }
  
  // Handle claim submission
  const handleCreateClaim = (policyId: number) => {
    createClaimMutation.mutate({
      policyId,
      data: {
        reason: 'Flight delay',
        delayTime: 120 // 2 hours delay
      }
    })
  }
  
  // Get flight status
  const checkFlightStatus = async (flightNumber: string) => {
    try {
      const status = await apiService.getFlightStatus(flightNumber)
      alert(`Flight ${flightNumber} status: ${status.status}${status.delayTime ? ` (Delayed by ${status.delayTime} minutes)` : ''}`)
    } catch (error) {
      alert('Failed to fetch flight status')
    }
  }

  // Find claim for a policy
  const findClaimForPolicy = (policyId: number) => {
    return claims?.find(claim => claim.policyId === policyId);
  }
  
  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Customer Dashboard</h1>
        <div className="space-x-4">
          <Link href="/blockchain-status" className="text-blue-600 hover:underline">
            Blockchain Status
          </Link>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Policies</h2>
            
            {isLoadingPolicies || isLoadingClaims ? (
              <p>Loading policies...</p>
            ) : policies && policies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flight</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coverage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {policies.map((policy) => {
                      const claim = findClaimForPolicy(policy.id);
                      return (
                        <tr key={policy.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{policy.policyNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{policy.flightNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(policy.departureTime).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{policy.coverageAmount}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${policy.status === 'active' ? 'bg-green-100 text-green-800' : 
                                policy.status === 'claimed' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {policy.status}
                            </span>
                            {claim && claim.status === 'rejected' && (
                              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Claim Rejected
                              </span>
                            )}
                            {claim && claim.blockchainVerified && (
                              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                ⬡ Blockchain Verified
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => checkFlightStatus(policy.flightNumber)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              Check Flight
                            </button>
                            
                            {policy.status === 'active' && (
                              <button 
                                onClick={() => handleCreateClaim(policy.id)}
                                className="text-green-600 hover:text-green-900"
                                disabled={createClaimMutation.isPending}
                              >
                                {createClaimMutation.isPending ? 'Processing...' : 'Submit Claim'}
                              </button>
                            )}
                            
                            {claim && claim.status === 'paid' && (
                              <span className="text-blue-600">
                                Paid via {claim.verificationMethod === 'blockchain' ? 'Blockchain' : 'Manual Processing'}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No policies found. Create one now!</p>
            )}
          </div>

          {claims && claims.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md mt-8">
              <h2 className="text-xl font-semibold mb-4">Your Claims</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {claims.map((claim) => (
                      <tr key={claim.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{claim.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {policies?.find(p => p.id === claim.policyId)?.policyNumber || claim.policyId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{claim.payoutAmount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              claim.status === 'approved' ? 'bg-blue-100 text-blue-800' : 
                              claim.status === 'paid' ? 'bg-green-100 text-green-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {claim.blockchainVerified ? (
                            <span className="text-purple-600 font-semibold">⬡ Blockchain</span>
                          ) : (
                            <span>Manual</span>
                          )}
                          {claim.transactionHash && (
                            <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                              Tx: {claim.transactionHash.substring(0, 10)}...
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        <div className="col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Purchase Flight Insurance</h2>
            
            <form onSubmit={handleCreatePolicy}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="flightNumber">
                  Flight Number
                </label>
                <input
                  id="flightNumber"
                  type="text"
                  placeholder="e.g. AI302"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newPolicy.flightNumber}
                  onChange={(e) => setNewPolicy({...newPolicy, flightNumber: e.target.value})}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="departureTime">
                  Departure Time
                </label>
                <input
                  id="departureTime"
                  type="datetime-local"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newPolicy.departureTime}
                  onChange={(e) => setNewPolicy({...newPolicy, departureTime: e.target.value})}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="coverageAmount">
                  Coverage Amount (₹)
                </label>
                <input
                  id="coverageAmount"
                  type="number"
                  placeholder="5000"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newPolicy.coverageAmount || ''}
                  onChange={(e) => setNewPolicy({...newPolicy, coverageAmount: parseFloat(e.target.value)})}
                  min="1000"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="premium">
                  Premium (₹)
                </label>
                <input
                  id="premium"
                  type="number"
                  placeholder="500"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newPolicy.premium || ''}
                  onChange={(e) => setNewPolicy({...newPolicy, premium: parseFloat(e.target.value)})}
                  min="100"
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                  disabled={createPolicyMutation.isPending}
                >
                  {createPolicyMutation.isPending ? 'Creating...' : 'Purchase Insurance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
} 