import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, ThumbsUp, ThumbsDown, RefreshCw, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/device-id";
import type { Message } from "@/lib/models";
import heofonixLogo from "@/assets/heofonix-logo.png";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  showActions?: boolean;
  conversationId?: string | null;
}

export function ChatMessage({ message, isStreaming, onRegenerate, showActions, conversationId }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [copied, setCopied] = useState(false);
  const isError = !isUser && message.content.startsWith("Error:");

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = async (type: "up" | "down") => {
    const newFeedback = feedback === type ? null : type;
    setFeedback(newFeedback);
    if (newFeedback) {
      await supabase.from("feedback").insert({
        conversation_id: conversationId || "",
        message_content: message.content.slice(0, 500),
        feedback_type: newFeedback,
        device_id: getDeviceId(),
      });
    }
  };

  return (
    <div className={`group flex gap-3 px-4 py-5 ${isUser ? "" : "bg-card/50"}`}>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${
          isUser ? "bg-primary/20 text-primary" : ""
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <img src={heofonixLogo} alt="Heofonix" className="w-8 h-8 rounded-lg object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-xs font-medium text-muted-foreground mb-1.5">
          {isUser ? "You" : "Heofonix AI"}
        </p>
        <div className={`prose-chat text-sm ${isError ? "text-destructive" : ""}`}>
          {isUser ? (
            <p>{message.content}</p>
          ) : isError ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-destructive text-sm">
                {message.content.includes("credits exhausted")
                  ? "Heofonix AI is temporarily unavailable. Please try again later."
                  : message.content.replace("Error: ", "")}
              </p>
            </div>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          )}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
          )}
        </div>

        {!isUser && !isStreaming && showActions && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Copy"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => handleFeedback("up")}
              className={`p-1.5 rounded-md hover:bg-secondary transition-colors ${
                feedback === "up" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Good response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleFeedback("down")}
              className={`p-1.5 rounded-md hover:bg-secondary transition-colors ${
                feedback === "down" ? "text-destructive" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Bad response"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
