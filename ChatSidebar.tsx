import { MessageSquarePlus, Trash2, MessageCircle } from "lucide-react";
import type { Conversation } from "@/lib/models";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:relative z-50 top-0 left-0 h-full w-72 bg-card border-r border-border flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-border">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-primary font-medium"
          >
            <MessageSquarePlus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-8">
              No conversations yet
            </p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                activeId === conv.id
                  ? "bg-primary/15 text-foreground"
                  : "hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                onSelect(conv.id);
                onClose();
              }}
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1 truncate text-sm">{conv.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Heofonix AI • Privacy First
          </p>
        </div>
      </aside>
    </>
  );
}
