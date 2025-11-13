import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  Search, 
  MessageSquare,
  Sparkles,
  Plus
} from 'lucide-react';
import { ChatConversation, User } from '@/entities/all';
import { formatDistanceToNow } from 'date-fns';

export default function AIInboxPage() {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredConversations(
        conversations.filter(conv => 
          conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredConversations(conversations);
    }
  }, [conversations, searchQuery]);

  const loadConversations = async () => {
    try {
      const user = await User.me().catch(() => ({ email: '' }));
      const userConversations = await ChatConversation.filter(
        { created_by: user.email }, 
        '-last_message_date'
      );
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Mock data for demo
      setConversations([
        {
          id: '1',
          title: 'Lipid Panel Discussion',
          preview: 'Your cholesterol levels are slightly elevated...',
          last_message_date: '2024-12-18T10:30:00Z',
          created_date: '2024-12-18T10:00:00Z'
        },
        {
          id: '2',
          title: 'Workout Plan Creation',
          preview: 'Here\'s a 30-minute full-body workout...',
          last_message_date: '2024-12-17T14:15:00Z',
          created_date: '2024-12-17T14:00:00Z'
        },
        {
          id: '3',
          title: 'Nutrition Advice',
          preview: 'For a healthy breakfast, I recommend...',
          last_message_date: '2024-12-16T08:45:00Z',
          created_date: '2024-12-16T08:30:00Z'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-4 pt-12 space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-2xl"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <Link to={createPageUrl("AIAgent")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Chat History</h1>
        <Link to={createPageUrl("AIAgent")} className="p-2 -mr-2">
          <Plus className="w-6 h-6 text-gray-600" />
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200 rounded-xl h-12"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="px-4 space-y-4">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <Link key={conversation.id} to={createPageUrl(`AIConversation?id=${conversation.id}`)}>
              <Card className="bg-white rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {conversation.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {conversation.preview}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(conversation.last_message_date), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="bg-white rounded-2xl border-0 shadow-sm">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No conversations found' : 'No chat history yet'}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Start a conversation with your AI Health Agent to see it here'
                }
              </p>
              <Link to={createPageUrl("AIAgent")}>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Start New Chat
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}