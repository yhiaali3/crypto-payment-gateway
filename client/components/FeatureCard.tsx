import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-xl border border-gray-200 bg-white hover:border-primary hover:shadow-lg",
        "transition-all duration-300 group",
        className,
      )}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-crypto-blue/10 rounded-lg flex items-center justify-center group-hover:from-primary/20 group-hover:to-crypto-blue/20 transition-colors mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
