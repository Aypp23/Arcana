import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { useChat } from '@/hooks/useChat';
import { useWallet } from '@/contexts/WalletContext';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const { messages, isTyping, isPaying, sendMessage } = useChat();
  const { isConnected } = useWallet();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.providerName) {
      toast.success(`Connected to ${location.state.providerName}`);
      // Clear state so it doesn't toast again on refresh/navigation?
      // Actually standard behavior is fine, but maybe clear it.
      // For now, simple is fine.
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <Layout>
      <div className="flex-1 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hidden">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="text-center max-w-lg animate-slide-up">
                <h1 className="text-4xl md:text-5xl font-normal mb-2">
                  <span className="gemini-gradient">Meet Arcana,</span>
                </h1>
                <h2 className="text-4xl md:text-5xl font-normal text-foreground/80">
                  your personal crypto AI assistant
                </h2>
              </div>
            </div>
          ) : (
            <div className="py-6 space-y-6">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  id={message.id}
                  content={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  imagePreview={message.imagePreview}
                  agentsUsed={message.agentsUsed}
                />
              ))}
              {isPaying && (
                <div className="px-4 max-w-3xl mx-auto">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Waiting for payment confirmation...
                  </div>
                </div>
              )}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="sticky bottom-0 z-30 bg-background pb-4 pt-2">
          <ChatInput onSend={sendMessage} disabled={!isConnected || isTyping || isPaying} />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
