import ChatList from '@/components/features/chat/ChatList'
import ChatArea from '@/components/layout/ChatArea'
import MainLayout from '@/components/layout/MainLayout'

export default function ChatPage() {
  return (
    <MainLayout>
      <div className="flex h-full">
        <div className="w-80 border-r border-gray-200 bg-white">
          <ChatList />
        </div>
        <div className="flex-1">
          <ChatArea />
        </div>
      </div>
    </MainLayout>
  )
} 