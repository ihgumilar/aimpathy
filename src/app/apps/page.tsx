import MainLayout from '@/components/layout/MainLayout'
import { Download } from 'lucide-react'

export default function AppsPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Apps & Integrations</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example App Card */}
          <div className="p-6 bg-white rounded-lg border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Example App</h3>
                <p className="text-sm text-gray-600 mt-1">Description of the app</p>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg">
                <Download size={16} />
                Install
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 