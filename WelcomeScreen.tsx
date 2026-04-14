import { MODELS } from "@/lib/models";
import { ModelIcon } from "@/components/ModelIcon";
import type { ModelId } from "@/lib/models";
import heofonixLogo from "@/assets/heofonix-logo.png";

interface WelcomeScreenProps {
  onSend: (message: string) => void;
  currentModel: ModelId;
}

const SUGGESTIONS = [
  "Explain quantum computing in simple terms",
  "Write a Python function to sort a list",
  "What are the latest trends in AI?",
  "Help me plan a healthy meal for the week",
];

export function WelcomeScreen({ onSend, currentModel }: WelcomeScreenProps) {
  const model = MODELS.find((m) => m.id === currentModel)!;

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <img
            src={heofonixLogo}
            alt="Heofonix AI"
            className="w-20 h-20 mx-auto rounded-2xl object-cover"
          />
          <h1 className="text-5xl font-bold gradient-text tracking-tight">
            Heofonix AI
          </h1>
          <p className="text-muted-foreground text-lg flex items-center justify-center gap-2">
            Powered by <ModelIcon icon={model.icon} className="w-5 h-5 text-primary" /> {model.name}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSend(s)}
              className="text-left px-4 py-3 rounded-xl bg-card hover:bg-secondary/80 border border-border hover:border-primary/30 transition-all text-sm text-muted-foreground hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gradient-cyan animate-pulse" />
            Privacy First
          </span>
          <span>-</span>
          <span>No data stored</span>
          <span>-</span>
          <span>5 AI Models</span>
        </div>
      </div>
    </div>
  );
}
