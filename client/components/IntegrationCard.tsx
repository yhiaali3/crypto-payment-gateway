import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IntegrationCardProps {
  logo: ReactNode;
  name: string;
  description: string;
  status?: "available" | "coming-soon";
  className?: string;
}

export function IntegrationCard({
  logo,
  name,
  description,
  status = "available",
  className,
}: IntegrationCardProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-xl border border-gray-200 bg-white hover:border-primary hover:shadow-lg",
        "transition-all duration-300 group relative",
        className,
      )}
    >
      {status === "coming-soon" && (
        <div className="absolute top-4 right-4">
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
            Coming Soon
          </span>
        </div>
      )}

      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg flex items-center justify-center group-hover:from-primary/5 group-hover:to-crypto-blue/5 transition-colors mb-4">
        {logo}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
      <p className="text-gray-600 text-sm">{description}</p>

      {status === "available" && (
        <button className="mt-4 text-primary hover:text-primary/80 text-sm font-medium transition-colors">
          Learn more →
        </button>
      )}
    </div>
  );
}
