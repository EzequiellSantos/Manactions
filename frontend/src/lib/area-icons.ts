import {
  Briefcase,
  DollarSign,
  Headphones,
  Megaphone,
  Monitor,
  Scale,
  Settings,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export const AREA_ICON_MAP: Record<string, LucideIcon> = {
  Briefcase,
  DollarSign,
  Headphones,
  Megaphone,
  Monitor,
  Scale,
  Settings,
  ShieldCheck,
  Users,
};

export const AREA_ICON_OPTIONS = Object.keys(AREA_ICON_MAP);

export function getAreaIcon(iconName: string): LucideIcon {
  return AREA_ICON_MAP[iconName] ?? Briefcase;
}
