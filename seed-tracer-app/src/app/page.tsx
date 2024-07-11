'use client'

import { useState } from 'react'
import Overview from '../components/Overview'
import FundingInfo from '../components/FundingInfo'
import { ApiResponse } from '../types'

export default function Home() {
  const [chain, setChain] = useState<string>('ETH')
  const [address, setAddress] = useState<string>('')
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchTrace = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/trace?address=${address}&searchTillRoot=true`)
      const data: ApiResponse = await response.json()
      setApiResponse(data)
    } catch (error) {
      console.error('Error fetching data: ', error)
      setApiResponse(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (address) {
      fetchTrace()
    } else {
      alert('Please enter an Ethereum address.')
    }
  }

  const fundingInfoAvailable = apiResponse?.fundingInfo && Array.isArray(apiResponse.fundingInfo)
  const firstLabelIndex = fundingInfoAvailable
    ? apiResponse.fundingInfo.findIndex(info => (info.labelsFound && info.labelsFound.length > 0))
    : -1
  const fundingSource = firstLabelIndex !== -1 && apiResponse
    ? apiResponse.fundingInfo[firstLabelIndex].labelsFound.join(', ')
    : 'No labels found'
  const totalHops = fundingInfoAvailable && apiResponse
    ? apiResponse.fundingInfo.length
    : 0

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <div className="flex flex-wrap justify-center items-center gap-4">
            <select
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ETH">Ethereum (ETH)</option>
            </select>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Ethereum address"
              className="bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition duration-300 ease-in-out disabled:bg-gray-500"
            >
              {isLoading ? 'Loading...' : 'Get Trace'}
            </button>
          </div>
        </div>

        {apiResponse && (
          <div className="space-y-8">
            <Overview
              age={apiResponse.age}
              nonce={apiResponse.nonce}
              fundingHops={firstLabelIndex !== -1 ? firstLabelIndex + 1 : 'No funding source found'}
              totalHops={totalHops}
              fundingSource={fundingSource}
            />
            {fundingInfoAvailable && (
              <FundingInfo fundingInfo={apiResponse.fundingInfo} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}