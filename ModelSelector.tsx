import { MODELS, type ModelId } from "@/lib/models";
import { ModelIcon } from "@/components/ModelIcon";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ModelSelectorProps {
  value: ModelId;
  onChange: (model: ModelId) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = MODELS.find((m) => m.id === value)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
      >
        <ModelIcon icon={current.icon} className="w-4 h-4" />
        <span>{current.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 w-72 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onChange(model.id as ModelId);
                setOpen(false);
              }}
              className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors text-left ${
                value === model.id ? "bg-primary/10" : ""
              }`}
            >
              <ModelIcon icon={model.icon} className="w-5 h-5 mt-0.5 text-primary" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{model.name}</span>
                  {"badge" in model && model.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-primary to-accent text-accent-foreground font-semibold">
                      {model.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{model.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
