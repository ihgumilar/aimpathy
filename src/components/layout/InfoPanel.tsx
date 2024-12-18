'use client'

import { Info, CheckCircle } from 'lucide-react'

export default function InfoPanel() {
  return (
    <div className="w-[300px] border-l border-gray-200 p-4 bg-white">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Info size={20} />
            Model Information
          </h3>
          <div className="mt-2 text-sm text-gray-600">
            <p>Context Window: 128,000 tokens</p>
            <p>Model: Claude 3.5 Sonnet</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle size={20} />
            Fact Check History
          </h3>
          <div className="mt-2 text-sm text-gray-600">
            <p>No fact checks performed yet</p>
          </div>
        </div>
      </div>
    </div>
  )
} 