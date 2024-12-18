'use client'

import Sidebar from './Sidebar'
import InfoPanel from './InfoPanel'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-50 overflow-auto">
        {children}
      </main>
      <InfoPanel />
    </div>
  )
} 