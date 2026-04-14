import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { streamChat } from "@/lib/chat-api";
import { getDeviceId } from "@/lib/device-id";
import type { Message, ModelId, Conversation } from "@/lib/models";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelId>("heofonix-2.0");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const deviceId = getDeviceId();

  const loadConversations = useCallback(async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("device_id", deviceId)
      .order("updated_at", { ascending: false });
    if (data) setConversations(data);
  }, [deviceId]);

  const loadMessages = useCallback(async (conversationId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("device_id", deviceId)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
      setActiveConversationId(conversationId);
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) setCurrentModel(conv.model as ModelId);
    }
  }, [conversations, deviceId]);

  const createConversation = useCallback(async (title: string, model: string) => {
    const { data } = await supabase
      .from("conversations")
      .insert({ title, model, device_id: deviceId })
      .select()
      .single();
    if (data) {
      setActiveConversationId(data.id);
      await loadConversations();
      return data.id;
    }
    return null;
  }, [loadConversations, deviceId]);

  const deleteConversation = useCallback(async (id: string) => {
    await supabase.from("conversations").delete().eq("id", id);
    if (activeConversationId === id) {
      setMessages([]);
      setActiveConversationId(null);
    }
    await loadConversations();
  }, [activeConversationId, loadConversations]);

  const newChat = useCallback(() => {
    setMessages([]);
    setActiveConversationId(null);
  }, []);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    let convId = activeConversationId;
    if (!convId) {
      const title = input.trim().slice(0, 50) || "New Chat";
      convId = await createConversation(title, currentModel);
    }

    if (convId) {
      await supabase.from("messages").insert({
        conversation_id: convId,
        role: "user",
        content: input.trim(),
        device_id: deviceId,
      });
    }

    let assistantSoFar = "";
    const controller = new AbortController();
    abortRef.current = controller;

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: updatedMessages,
      model: currentModel,
      signal: controller.signal,
      onDelta: upsertAssistant,
      onDone: async () => {
        setIsLoading(false);
        if (convId && assistantSoFar) {
          await supabase.from("messages").insert({
            conversation_id: convId,
            role: "assistant",
            content: assistantSoFar,
            device_id: deviceId,
          });
          await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", convId);
          loadConversations();
        }
      },
      onError: (err) => {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${err}` },
        ]);
      },
    });
  }, [messages, isLoading, activeConversationId, currentModel, createConversation, loadConversations, deviceId]);

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const regenerateLastMessage = useCallback(async () => {
    if (isLoading || messages.length < 2) return;
    // Find the last user message
    const lastUserIdx = [...messages].reverse().findIndex(m => m.role === "user");
    if (lastUserIdx === -1) return;
    const idx = messages.length - 1 - lastUserIdx;
    const lastUserMsg = messages[idx].content;
    // Remove messages from that user message onward
    const trimmed = messages.slice(0, idx);
    setMessages(trimmed);
    // Re-send that message
    const userMsg: Message = { role: "user", content: lastUserMsg };
    const updatedMessages = [...trimmed, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    let assistantSoFar = "";
    const controller = new AbortController();
    abortRef.current = controller;

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: updatedMessages,
      model: currentModel,
      signal: controller.signal,
      onDelta: upsertAssistant,
      onDone: async () => {
        setIsLoading(false);
        if (activeConversationId && assistantSoFar) {
          await supabase.from("messages").insert({
            conversation_id: activeConversationId,
            role: "assistant",
            content: assistantSoFar,
            device_id: deviceId,
          });
        }
      },
      onError: (err) => {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${err}` },
        ]);
      },
    });
  }, [messages, isLoading, activeConversationId, currentModel, deviceId]);

  return {
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
  };
}
