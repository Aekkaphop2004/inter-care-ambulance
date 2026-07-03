import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
}

export function DynamicIcon({ name, className }: DynamicIconProps) {
  // Perform a case-insensitive or case-sensitive match with a safe fallback
  const IconComponent = (Icons as any)[name];
  
  if (!IconComponent) {
    // Safe fallback if the icon name is invalid or misspelled
    return <Icons.HelpCircle className={className} />;
  }
  
  return <IconComponent className={className} />;
}

// Export list of popular ambulance/medical icons so administrators can pick easily
export const POPULAR_ICONS = [
  "Activity",
  "Truck",
  "ShieldAlert",
  "HeartPulse",
  "Shield",
  "Plus",
  "Phone",
  "MapPin",
  "Clock",
  "Users",
  "Briefcase",
  "CheckSquare",
  "Award",
  "Building",
  "FileText",
  "Stethoscope",
  "Flame",
  "Home",
  "Heart",
  "Bell"
];
