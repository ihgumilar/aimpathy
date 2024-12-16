import { Suspense } from 'react'
import Link from 'next/link'
import DocumentUpload from '../components/DocumentUpload'
import Chat from '../components/Chat'
import { ArrowLeft } from 'lucide-react'

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-4">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <div className="max-w-3xl mx-auto">
          <DocumentUpload />
          <Suspense fallback={<div className="text-center">Loading chat...</div>}>
            <Chat />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

