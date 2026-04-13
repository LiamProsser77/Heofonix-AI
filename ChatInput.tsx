import { useState, useRef, useEffect } from "react";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, onStop, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative gradient-border rounded-xl bg-card">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Heofonix anything..."
            className="w-full bg-transparent resize-none px-4 py-3 pr-14 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[48px] max-h-[200px]"
            rows={1}
          />
          <button
            onClick={isLoading ? onStop : handleSubmit}
            disabled={!isLoading && !input.trim()}
            className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all ${
              isLoading
                ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                : input.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {isLoading ? <Square className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-2">
          Heofonix AI doesn't store personal information. Chats are saved locally.
        </p>
      </div>
    </div>
  );
}
