import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PromptData {
  system: string;
  user: string;
}

interface AIInterpretationProps {
  interpretation: string;
  isLoading?: boolean;
  prompt?: PromptData;
}

export function AIInterpretation({ interpretation, isLoading, prompt }: AIInterpretationProps) {
  const [isPromptOpen, setIsPromptOpen] = useState(false);

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

      {/* AI Prompt Section - Collapsible */}
      {!isLoading && prompt && (
        <Collapsible open={isPromptOpen} onOpenChange={setIsPromptOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2 border-t border-dashed border-border/50">
            {isPromptOpen ? (
              <>
                <ChevronUp className="w-3 h-3" />
                <span>隱藏 AI Prompt</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                <span>查看完整 AI Prompt</span>
              </>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="bg-muted/30 rounded-lg p-3 space-y-3 text-xs border border-border/30">
              <div>
                <p className="font-medium text-foreground mb-1 flex items-center gap-1">
                  <Badge variant="outline" className="text-xs bg-cinnabar/10 text-cinnabar border-cinnabar/30">
                    System
                  </Badge>
                  <span>系統提示詞</span>
                </p>
                <pre className="text-muted-foreground leading-relaxed whitespace-pre-wrap bg-background/50 p-2 rounded border border-border/20 overflow-x-auto">
                  {prompt.system}
                </pre>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1 flex items-center gap-1">
                  <Badge variant="outline" className="text-xs bg-jade/10 text-jade border-jade/30">
                    User
                  </Badge>
                  <span>用戶提示詞</span>
                </p>
                <pre className="text-muted-foreground leading-relaxed whitespace-pre-wrap bg-background/50 p-2 rounded border border-border/20 overflow-x-auto">
                  {prompt.user}
                </pre>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <div className="pt-2 text-xs text-muted-foreground border-t">
        <p className="leading-relaxed">💡 此解讀由 AI 智慧生成，結合傳統占卜智慧與現代技術</p>
      </div>
    </Card>
  );
}
