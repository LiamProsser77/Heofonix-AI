import { useEffect, useRef, useState } from "react";
import { Menu, ExternalLink } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import heofonixLogo from "@/assets/heofonix-logo.png";

const Index = () => {
  const {
    messages,
    isLoading,
    currentModel,
    setCurrentModel,
    conversations,
    activeConversationId,
    loadConversations,
    loadMessages,
    deleteConversation,
    newChat,
    sendMessage,
    stopGeneration,
    regenerateLastMessage,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={loadMessages}
        onNew={newChat}
        onDelete={deleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src={heofonixLogo} alt="Heofonix" className="w-7 h-7 rounded-lg object-cover" />
          <h2 className="text-lg font-bold gradient-text">Heofonix</h2>
          <div className="flex-1" />
          <a
            href="https://heofonglobalsearch-com.lovable.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Heofon Search</span>
          </a>
          <ModelSelector value={currentModel} onChange={setCurrentModel} />
        </header>

        {messages.length === 0 ? (
          <WelcomeScreen onSend={sendMessage} currentModel={currentModel} />
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  message={msg}
                  isStreaming={
                    isLoading &&
                    i === messages.length - 1 &&
                    msg.role === "assistant"
                  }
                  showActions={msg.role === "assistant"}
                  conversationId={activeConversationId}
                  onRegenerate={
                    i === messages.length - 1 && msg.role === "assistant"
                      ? regenerateLastMessage
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        )}

        <ChatInput
          onSend={sendMessage}
          onStop={stopGeneration}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Index;
