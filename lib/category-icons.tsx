import {
  AirVent, Baby, BookOpen, Brain, CakeSlice, Calculator, Camera, ClipboardCheck, Droplets, Dumbbell, Ellipsis, GraduationCap, Hammer,
  HandHeart, KeyRound, Languages, Laptop, LayoutGrid, MessageCircleHeart, Music, PaintRoller, Palette, PawPrint, Scale, Scissors, Smile,
  Sofa, Sparkles, Stethoscope, Truck, WashingMachine, Zap, type LucideIcon,
} from "lucide-react";

/** Значки категорий — в фильтрах каталога и везде, где нужен маленький значок рядом с названием. */
export const CATEGORY_ICON: Record<string, LucideIcon> = {
  all: LayoutGrid,
  plumber: Droplets,
  electrician: Zap,
  repair: PaintRoller,
  inspection: ClipboardCheck,
  handyman: Hammer,
  aircon: AirVent,
  appliances: WashingMachine,
  furniture: Sofa,
  cleaning: Sparkles,
  moving: Truck,
  nanny: Baby,
  tutor: GraduationCap,
  speech: MessageCircleHeart,
  languages: BookOpen,
  music: Music,
  doctor: Stethoscope,
  dentist: Smile,
  psychologist: Brain,
  massage: HandHeart,
  vet: PawPrint,
  beauty: Scissors,
  fitness: Dumbbell,
  lawyer: Scale,
  accountant: Calculator,
  translator: Languages,
  realtor: KeyRound,
  photo: Camera,
  it: Laptop,
  food: CakeSlice,
  art: Palette,
  other: Ellipsis,
};

export function CategoryIcon({ id, className = "h-4 w-4" }: { id: string; className?: string }) {
  const I = CATEGORY_ICON[id] ?? Ellipsis;
  return <I className={className} aria-hidden strokeWidth={2} />;
}
