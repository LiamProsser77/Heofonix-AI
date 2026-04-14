import { Zap, Globe, Sparkles, Rocket, Brain } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Globe,
  Sparkles,
  Rocket,
  Brain,
};

interface ModelIconProps {
  icon: string;
  className?: string;
}

export function ModelIcon({ icon, className = "w-4 h-4" }: ModelIconProps) {
  const Icon = iconMap[icon];
  if (!Icon) return null;
  return <Icon className={className} />;
}
