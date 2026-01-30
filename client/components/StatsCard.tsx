import { cn } from "@/lib/utils";

interface StatsCardProps {
  number: string;
  label: string;
  className?: string;
}

export function StatsCard({ number, label, className }: StatsCardProps) {
  return (
    <div className={cn("text-center", className)}>
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-crypto-blue bg-clip-text text-transparent">
        {number}
      </div>
      <p className="text-gray-600 mt-2 text-sm md:text-base">{label}</p>
    </div>
  );
}
