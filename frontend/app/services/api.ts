import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Policy {
  id: number;
  policyNumber: string;
  userAddress: string;
  flightNumber: string;
  departureTime: string;
  coverageAmount: number;
  premium: number;
  status: 'active' | 'claimed' | 'expired';
  blockchainPolicyId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: number;
  policyId: number;
  reason: string;
  delayTime: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  payoutAmount: number;
  transactionHash?: string;
  blockchainVerified?: boolean;
  verificationMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlightStatus {
  flightNumber: string;
  status: 'ON_TIME' | 'DELAYED' | 'CANCELLED';
  delayTime: number;
  departureTime: string;
  arrivalTime: string;
}

export interface CreatePolicyData {
  userAddress: string;
  flightNumber: string;
  departureTime: string;
  coverageAmount: number;
  premium: number;
}

export interface CreateClaimData {
  reason: string;
  delayTime: number;
}

export interface BlockchainStatus {
  status: string;
  database: string;
  blockchain: string;
  contract: string;
}

// API functions
export const apiService = {
  // Policies
  getPolicies: async (): Promise<Policy[]> => {
    const response = await axios.get(`${API_URL}/api/policies`);
    return response.data;
  },
  
  getPolicy: async (id: number): Promise<Policy> => {
    const response = await axios.get(`${API_URL}/api/policies/${id}`);
    return response.data;
  },
  
  createPolicy: async (data: CreatePolicyData): Promise<Policy> => {
    const response = await axios.post(`${API_URL}/api/policies`, data);
    return response.data;
  },
  
  // Claims
  getClaims: async (): Promise<Claim[]> => {
    const response = await axios.get(`${API_URL}/api/claims`);
    return response.data;
  },
  
  createClaim: async (policyId: number, data: CreateClaimData): Promise<Claim> => {
    const response = await axios.post(`${API_URL}/api/policies/${policyId}/claims`, data);
    return response.data;
  },
  
  // Flight status
  getFlightStatus: async (flightNumber: string): Promise<FlightStatus> => {
    const response = await axios.get(`${API_URL}/api/flights/${flightNumber}`);
    return response.data;
  },
  
  // Blockchain status
  getBlockchainStatus: async (): Promise<BlockchainStatus> => {
    const response = await axios.get(`${API_URL}/api/health`);
    return response.data;
  }
}; 