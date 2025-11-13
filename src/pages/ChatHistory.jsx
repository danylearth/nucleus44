import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, MessageSquare, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ChatHistoryPage() {
  // Mock chat history data - in a real app, this would come from your database
  const [chatHistory] = useState([
    {
      id: 1,
      title: "Lipid Panel Discussion",
      lastMessage: "Thank you for explaining my cholesterol levels...",
      timestamp: "2 hours ago",
      messageCount: 8
    },
    {
      id: 2,
      title: "Breakfast Suggestions",
      lastMessage: "What about oatmeal with berries?",
      timestamp: "Yesterday",
      messageCount: 5
    },
    {
      id: 3,
      title: "Workout Planning",
      lastMessage: "I'll try that 30-minute routine",
      timestamp: "2 days ago",
      messageCount: 12
    },
    {
      id: 4,
      title: "Sleep Quality Tips",
      lastMessage: "My sleep has improved since following your advice",
      timestamp: "3 days ago",
      messageCount: 6
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12 bg-white border-b">
        <Link to={createPageUrl("AIAgent")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Chat History</h1>
        <div className="w-10 h-10"></div> {/* Spacer */}
      </div>

      {/* Chat History List */}
      <div className="p-4 space-y-3">
        {chatHistory.map((chat) => (
          <Link key={chat.id} to={createPageUrl("AIAgent")}>
            <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{chat.title}</h3>
                    <p className="text-sm text-gray-500 truncate mb-1">{chat.lastMessage}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{chat.timestamp}</span>
                      <span>•</span>
                      <span>{chat.messageCount} messages</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        
        {chatHistory.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No chat history</h3>
            <p className="text-gray-500 text-sm">Start a conversation to see your chat history here</p>
          </div>
        )}
      </div>
    </div>
  );
}