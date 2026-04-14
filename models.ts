export const MODELS = [
  {
    id: "heofonix-1.0",
    name: "Heofonix 1.0",
    description: "Fast & friendly general assistant",
    icon: "Zap",
  },
  {
    id: "heofonix-2.0",
    name: "Heofonix 2.0",
    description: "Advanced model with web search",
    icon: "Globe",
    badge: "Web Search",
  },
  {
    id: "heofonix-nova",
    name: "Heofonix Nova",
    description: "Creative & deep thinking",
    icon: "Sparkles",
  },
  {
    id: "heofonix-alpha",
    name: "Heofonix Alpha",
    description: "Lightning-fast responses",
    icon: "Rocket",
  },
  {
    id: "heofonix-gammaray-6.0",
    name: "Heofonix GammaRay 6.0",
    description: "Most powerful reasoning model",
    icon: "Brain",
    badge: "Pro",
  },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export type Conversation = {
  id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
};
