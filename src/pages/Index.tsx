import { useState, useEffect } from "react";
import { DivinationForm } from "@/components/DivinationForm";
import { DivinationCard } from "@/components/DivinationCard";
import { AIInterpretation } from "@/components/AIInterpretation";
import { calculateXiaoLiuRen, type DivinationResult } from "@/lib/xiaoliu";
import { initAI, interpretDivination, checkWebGPUSupport } from "@/lib/aiInterpreter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, AlertCircle } from "lucide-react";

const Index = () => {
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [interpretation, setInterpretation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiInitialized, setAiInitialized] = useState(false);
  const [webGPUSupported, setWebGPUSupported] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    checkWebGPUSupport().then(setWebGPUSupported);
  }, []);

  const handleInitAI = async () => {
    setAiLoading(true);
    setAiProgress(0);
    
    try {
      await initAI((progress) => {
        setAiProgress(Math.round(progress * 100));
      });
      setAiInitialized(true);
      toast({
        title: "AI 模型載入成功",
        description: "現在可以使用 AI 解讀功能了",
      });
    } catch (error) {
      toast({
        title: "AI 初始化失敗",
        description: error instanceof Error ? error.message : "請檢查您的瀏覽器是否支援 WebGPU",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleDivination = async (data: {
    month: number;
    day: number;
    hour: number;
    question: string;
  }) => {
    setIsLoading(true);
    setInterpretation("");
    setCurrentQuestion(data.question);

    // 計算卦象
    const divinationResult = calculateXiaoLiuRen(data.month, data.day, data.hour);
    
    // 添加動畫延遲
    setTimeout(() => {
      setResult(divinationResult);
      setIsLoading(false);

      toast({
        title: "占卜完成",
        description: `得到「${divinationResult.name}」卦`,
      });

      // 如果 AI 已初始化，自動生成解讀
      if (aiInitialized) {
        generateInterpretation(divinationResult, data.question);
      }
    }, 800);
  };

  const generateInterpretation = async (
    divinationResult: DivinationResult,
    question: string
  ) => {
    setAiLoading(true);
    
    try {
      const resultText = `${divinationResult.name}（${divinationResult.fortune}）：${divinationResult.description}`;
      const aiText = await interpretDivination(resultText, question);
      setInterpretation(aiText);
    } catch (error) {
      toast({
        title: "AI 解讀失敗",
        description: "請稍後重試",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-jade/5">
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4 animate-in fade-in-50 slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-jade via-gold to-cinnabar bg-clip-text text-transparent">
            小六壬占卜系統
          </h1>
          <p className="text-muted-foreground text-lg">
            傳統智慧 × 本地 AI · 掌中玄機，即刻解惑
          </p>
        </header>

        {/* WebGPU Warning */}
        {!webGPUSupported && (
          <Alert className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              您的瀏覽器不支援 WebGPU，AI 解讀功能將無法使用。建議使用 Chrome 113+ 或 Edge 113+ 瀏覽器。
            </AlertDescription>
          </Alert>
        )}

        {/* AI Initialization */}
        {!aiInitialized && webGPUSupported && (
          <div className="space-y-4 animate-in fade-in-50 duration-500">
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                啟用本地 AI 模型以獲得更深入的卦象解讀。AI 模型將在您的瀏覽器中運行，所有計算都在本地完成。
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleInitAI}
              disabled={aiLoading}
              className="w-full bg-gradient-to-r from-jade to-gold hover:opacity-90"
              size="lg"
            >
              {aiLoading ? (
                <span className="flex items-center gap-2">
                  載入 AI 模型中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  啟用 AI 解讀
                </span>
              )}
            </Button>
            {aiLoading && (
              <div className="space-y-2">
                <Progress value={aiProgress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  {aiProgress}% - 首次載入需要下載約 300MB 模型，請稍候...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
          <DivinationForm onSubmit={handleDivination} isLoading={isLoading} />
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <DivinationCard result={result} />
            
            {aiInitialized && (
              <>
                {!interpretation && !aiLoading && (
                  <Button
                    onClick={() => generateInterpretation(result, currentQuestion)}
                    variant="outline"
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    生成 AI 解讀
                  </Button>
                )}
                
                {(interpretation || aiLoading) && (
                  <AIInterpretation
                    interpretation={interpretation}
                    isLoading={aiLoading}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8 border-t animate-in fade-in-50 duration-700 delay-300">
          <p>小六壬源自中國傳統術數，此系統僅供參考娛樂</p>
          <p className="mt-2">✨ 本地 AI 運算 · 隱私安全 · 無需聯網</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
