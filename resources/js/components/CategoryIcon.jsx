import { Code2, Gamepad2, Presentation, Sparkles, Trophy, Wrench } from 'lucide-react';

const ICONS = {
  hackathon: Code2,
  seminar: Presentation,
  workshop: Wrench,
  competition: Trophy,
  esports: Gamepad2,
  other: Sparkles,
};

export default function CategoryIcon({ category, className = 'h-4 w-4' }) {
  const Icon = ICONS[category] || Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
