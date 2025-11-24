import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2 } from "lucide-react";

interface AIInterpretationProps {
  interpretation: string;
  isLoading?: boolean;
}

export function AIInterpretation({ interpretation, isLoading }: AIInterpretationProps) {
  return (
    <Card className="p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-divine border-gold/30 bg-gradient-to-br from-card to-gold/5">
      <div className="flex items-center gap-2 flex-wrap">
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
        <h3 className="text-lg sm:text-xl font-semibold">AI 智慧解讀</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          AI 解讀
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 sm:py-8 space-x-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          <span className="text-sm sm:text-base">AI 解讀生成中...</span>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none">
          <p className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-wrap">
            {interpretation}
          </p>
        </div>
      )}

      <div className="pt-2 text-xs text-muted-foreground border-t">
        <p className="leading-relaxed">💡 此解讀由 AI 智慧生成，結合傳統占卜智慧與現代技術</p>
      </div>
    </Card>
  );
}
