import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DivinationResult } from "@/lib/xiaoliu";

interface DivinationCardProps {
  result: DivinationResult;
}

export function DivinationCard({ result }: DivinationCardProps) {
  const colorClass = {
    jade: "bg-jade text-white",
    cinnabar: "bg-cinnabar text-white",
    gold: "bg-gold text-foreground",
    slate: "bg-slate-600 text-white",
    gray: "bg-gray-600 text-white",
    amber: "bg-amber-600 text-white",
  }[result.color] || "bg-primary text-primary-foreground";

  const fortuneColor = result.fortune.includes("大吉") 
    ? "bg-jade text-white" 
    : result.fortune.includes("吉") 
    ? "bg-gold text-foreground"
    : "bg-destructive text-destructive-foreground";

  return (
    <Card className="p-6 space-y-4 shadow-divine border-2 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-jade to-gold bg-clip-text text-transparent">
          {result.name}
        </h2>
        <Badge className={fortuneColor}>
          {result.fortune}
        </Badge>
      </div>
      
      <div className={`rounded-lg p-4 ${colorClass} shadow-soft`}>
        <p className="text-sm leading-relaxed">
          {result.description}
        </p>
      </div>

      <div className="pt-2 text-sm text-muted-foreground">
        <p>位置：第 {result.position} 位</p>
      </div>
    </Card>
  );
}
