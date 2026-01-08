import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, ChevronLeft, Inbox, Bot, Droplets, Utensils, ChevronRight, Paperclip, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { User } from '@/entities/User';
import ChatMessage from '../components/ai/ChatMessage';

export default function AIAgentPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState(null);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    loadUser();
    // Set initial context from URL
    const params = new URLSearchParams(location.search);
    const contextParam = params.get('context');
    if (contextParam) {
      try {
        const parsedContext = JSON.parse(decodeURIComponent(contextParam));
        setContext(parsedContext);
      } catch (e) {
        console.error("Failed to parse context:", e);
      }
    }
  }, [location.search]);

  const loadUser = async () => {
    try {
      setUserLoading(true);
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setUserLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText) => {
    if (messageText.trim() === '' || isLoading) return;

    const newUserMessage = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let prompt = `You are Nucleus AI, a helpful, professional health assistant.

Your role:
- Answer health-related questions clearly, concisely, and in plain language.
- Personalize insights when the user's biometric, blood, or DNA data is available, always grounding responses in science.
- Encourage safe and sustainable habits around nutrition, sleep, exercise, stress, and recovery.
- Stay supportive, positive, and engaging, like a knowledgeable health coach.

Boundaries:
- You are not a doctor and cannot diagnose conditions or prescribe treatments.
- Always remind users that for medical concerns, they should consult a licensed healthcare professional.
- Avoid giving advice that could cause harm (e.g., unsafe diets, extreme exercise, medical prescriptions).

Style:
- Use a friendly, encouraging tone that makes complex health concepts simple.
- Where useful, summarize with key takeaways or action steps.
- If data is missing, ask clarifying questions instead of guessing.
- When giving recommendations, offer options (e.g., "You could try X, or Y") rather than rigid rules.

User query: "${messageText}"`;

      if (context) {
        prompt += `\n\nContext: The user is asking about their ${context.type} data: ${JSON.stringify(context)}`;
      }

      const response = await InvokeLLM({ prompt });

      const assistantMessage = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error invoking LLM:", error);
      const errorMessage = { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again later." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    setInput(promptText);
    handleSendMessage(promptText);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  // If we have messages, show chat interface
  if (messages.length > 0) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-12 bg-white border-b">
          <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Chat</h1>
          <div className="p-2 -mr-2">
            <Inbox className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) =>
          <ChatMessage key={index} message={msg} />
          )}
          {isLoading && <ChatMessage isLoading={true} message={{ role: 'assistant', content: '' }} />}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <div className="p-4 bg-white border-t">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your health..."
              className="flex-1 border-gray-200 rounded-full px-4"
              disabled={isLoading} />

            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="rounded-full w-12 h-12 bg-gray-900 hover:bg-gray-800">

              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>);

  }

  // Initial welcome screen matching the reference design
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <Link to={createPageUrl("Dashboard")} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Chat</h1>
        <Link to={createPageUrl("ChatHistory")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
          <Inbox className="w-5 h-5 text-gray-500" />
        </Link>
      </div>

      {/* Main Content - Now the flex-1 container that scrolls */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top part with icon and greeting */}
        <div className="flex-shrink-0 flex flex-col items-center text-center pt-8 pb-8">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-0.5 shadow-lg">
              <div className="w-full h-full bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Bot className="w-10 h-10 text-gray-600" />
              </div>
            </div>
          </div>
          {userLoading ?
          <div className="animate-pulse">
              <div className="h-9 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
            </div> :

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hey, {firstName}!</h2>
          }
        </div>

        {/* White container for suggestions */}
        <div className="bg-white pt-6 pr-6 pb-2 pl-6 flex-1 rounded-t-[32px] shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
          <div className="w-full max-w-sm mx-auto">
            <p className="text-center text-gray-500 font-medium mb-6">Try asking me...</p>
            <div className="space-y-3">
              <Card
                className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleQuickPrompt("Explain my recent lipid panel")}>

                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="flex-1 text-gray-900 font-medium">Explain my recent lipid panel</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>

              <Card
                className="bg-white border rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleQuickPrompt("Suggest a healthy breakfast")}>

                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-teal-500" />
                  </div>
                  <span className="flex-1 text-gray-900 font-medium">Suggest a healthy breakfast</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Input */}
      <div className="p-4 bg-[#F7F8F8] border-t">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-md mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything"
            className="flex-1 border-gray-300 rounded-xl px-4 bg-white focus-visible:ring-1 focus-visible:ring-gray-400 h-[60px]"
            disabled={isLoading} />

          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="rounded-xl w-[60px] h-[60px] bg-gray-900 hover:bg-gray-800">

            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>);

}