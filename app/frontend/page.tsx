import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-6xl font-serif text-center mb-4">
          <span className="text-gray-800">br</span>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">AI</span>
          <span className="text-gray-800">n</span>
          <span className="text-indigo-700">Psyche</span>
        </h1>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
          Your Mental Health Companion,<br />
          transforming notes into actionable insights
        </p>
        
        <div className="mb-8 flex flex-col items-center">
          <Link href="/chat" className="hover:text-gray-600 transition-colors duration-200">
            <h2 className="text-xl font-medium tracking-wider uppercase mb-4">Insights Companion</h2>
          </Link>
          <Link href="/chat" className="block">
            <div className="relative aspect-[4/3] w-80 h-60 mb-8 overflow-hidden rounded-lg bg-gray-100 mx-auto">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20from%202024-12-16%2012-25-52-2KU6DX0x0mTPau3V2beJLz5gocnmv7.png"
                alt="A person in a red sweater reaching for books in a modern white bookshelf filled with colorful books"
                width={320}
                height={240}
                className="object-cover transition-transform duration-300 hover:scale-105"
                priority
              />
            </div>
          </Link>
          <div className="grid grid-cols-1 gap-8 justify-items-center">
            <Link 
              href="/chat" 
              className="group max-w-sm text-center bg-gray-50 hover:bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded transition-colors duration-200 border border-gray-200"
            >
              Upload your notes/journals /diaries/docs to explore meaningful insights.
            </Link>
          </div>
        </div>
        
        <footer className="text-center mt-12">
          <a 
            href="https://www.aimpathy.co.nz" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center text-lg"
          >
            <span className="text-red-600 font-bold">AI</span>
            <span className="text-gray-800 font-medium">mpathy</span>
          </a>
        </footer>
      </div>
    </div>
  )
}

