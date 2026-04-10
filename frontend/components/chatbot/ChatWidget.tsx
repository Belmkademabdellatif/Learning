'use client';

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useMutation, useQuery } from '@tanstack/react-query';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const { data: history } = useQuery({
    queryKey: ['chat-history'],
    queryFn: () => api.chat.getHistory(),
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: (msg: string) => api.chat.query(msg),
    onSuccess: () => {
      setMessage('');
    },
  });

  const handleSend = () => {
    if (message.trim()) {
      mutation.mutate(message);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="bg-primary-600 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">AI Learning Assistant</h3>
            <p className="text-sm opacity-90">Ask me anything about the course</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {history?.data?.map((msg: ChatMessage) => (
              <div key={msg.id} className="space-y-2">
                <div className="bg-gray-100 p-3 rounded-lg ml-auto max-w-[80%]">
                  <p className="text-sm">{msg.message}</p>
                </div>
                <div className="bg-primary-50 p-3 rounded-lg mr-auto max-w-[80%]">
                  <p className="text-sm">{msg.response}</p>
                </div>
              </div>
            ))}
            {mutation.isPending && (
              <div className="bg-primary-50 p-3 rounded-lg mr-auto max-w-[80%]">
                <p className="text-sm text-gray-500">Thinking...</p>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || mutation.isPending}
                className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
