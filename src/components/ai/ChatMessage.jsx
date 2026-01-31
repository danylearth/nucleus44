import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ message, isLoading }) {
  const { role, content } = message;
  const isAssistant = role === 'assistant';

  if (isLoading) {
    return (
      <div className="flex items-start gap-3 justify-start">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-purple-100">
            <Sparkles className="w-4 h-4 text-purple-600" />
          </AvatarFallback>
        </Avatar>
        <div className="bg-gray-200 rounded-lg p-3 max-w-md">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {isAssistant && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-purple-100">
            <Sparkles className="w-4 h-4 text-purple-600" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`rounded-lg p-3 max-w-md text-sm ${
          isAssistant
            ? 'bg-gray-100 text-gray-800'
            : 'bg-blue-500 text-white'
        }`}
      >
        {message.image && (
          <img src={message.image} alt="Uploaded" className="rounded-lg mb-2 max-w-full" />
        )}
        <ReactMarkdown
          className="prose prose-sm"
          components={{
            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-inside" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-inside" {...props} />,
            li: ({node, ...props}) => <li className="mb-1" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}