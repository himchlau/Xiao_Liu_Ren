import { useState } from "react";
import { DivinationForm } from "@/components/DivinationForm";
import { DivinationCard } from "@/components/DivinationCard";
import { AIInterpretation } from "@/components/AIInterpretation";
import { calculateXiaoLiuRen, detectLanguage, type DivinationResult } from "@/lib/xiaoliu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import templeBg from "@/assets/temple_lanterns.jpg";
import { Solar } from "lunar-javascript";

const Index = () => {
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [interpretation, setInterpretation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const { toast } = useToast();

  const handleDivination = async (data: {
    year: number;
    month: number;
    day: number;
    hour: number;
    question: string;
  }) => {
    setIsLoading(true);
    setInterpretation("");
    setCurrentQuestion(data.question);

    try {
      // 將陽曆轉換為農曆
      const solar = Solar.fromYmd(data.year, data.month, data.day);
      const lunar = solar.getLunar();
      
      const lunarMonth = lunar.getMonth();
      const lunarDay = lunar.getDay();
      
      console.log(`陽曆: ${data.year}-${data.month}-${data.day} -> 農曆: ${lunarMonth}月${lunarDay}日`);
      
      // 檢測問題語言
      const language = detectLanguage(data.question);

      // 使用農曆日期計算卦象
      const divinationResult = calculateXiaoLiuRen(lunarMonth, lunarDay, data.hour, language);
      
      // 添加動畫延遲
      setTimeout(async () => {
        setResult(divinationResult);

        const isEnglish = language === 'en';
        toast({
          title: isEnglish ? "Divination Complete" : "占卜完成",
          description: isEnglish 
            ? `Lunar Date: ${lunarMonth}/${lunarDay} - Result: "${divinationResult.name}"` 
            : `農曆: ${lunarMonth}月${lunarDay}日 - 得到「${divinationResult.name}」卦`,
        });

        // 自動生成 AI 解讀
        await generateInterpretation(divinationResult, data.question);
      }, 800);
    } catch (error) {
      console.error("日期轉換錯誤:", error);
      toast({
        title: "日期轉換失敗",
        description: "無法將陽曆轉換為農曆，請檢查輸入的日期是否正確",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const generateInterpretation = async (
    divinationResult: DivinationResult,
    question: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('interpret-divination', {
        body: {
          resultName: divinationResult.name,
          resultDescription: divinationResult.description,
          resultFortune: divinationResult.fortune,
          question: question,
        },
      });

      if (error) throw error;

      if (data?.interpretation) {
        setInterpretation(data.interpretation);
      } else {
        throw new Error('未收到有效的解讀結果');
      }
    } catch (error) {
      console.error("AI 解讀失敗:", error);
      toast({
        title: "AI 解讀失敗",
        description: error instanceof Error ? error.message : "無法生成智慧解讀，請稍後再試",
        variant: "destructive",
      });
      setInterpretation("暫時無法生成 AI 解讀，請稍後再試。您可以參考卦象的基本說明進行理解。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: `url(${templeBg})` }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8 relative z-10">
        {/* Header */}
        <header className="text-center space-y-4 animate-in fade-in-50 slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-jade via-gold to-cinnabar bg-clip-text text-transparent">
            小六壬占卜系統
          </h1>
          <p className="text-muted-foreground text-lg">
            傳統智慧 × AI 解讀 · 掌中玄機，即刻解惑
          </p>
        </header>

        {/* Form */}
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
          <DivinationForm onSubmit={handleDivination} isLoading={isLoading} />
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            <DivinationCard result={result} />
            <AIInterpretation
              interpretation={interpretation}
              isLoading={isLoading && !interpretation}
            />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8 border-t animate-in fade-in-50 duration-700 delay-300">
          <p>小六壬源自中國傳統術數，此系統僅供參考娛樂</p>
          <p className="mt-2">✨ AI 智慧解讀 · 傳統與科技結合</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
