import { useState } from "react";
import { Header } from "@/components/Header";
import { DivinationForm } from "@/components/DivinationForm";
import { DivinationCard } from "@/components/DivinationCard";
import { AIInterpretation } from "@/components/AIInterpretation";
import { EmailSubscribe } from "@/components/EmailSubscribe";
import { calculateXiaoLiuRen, detectLanguage, type DivinationResult } from "@/lib/xiaoliu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import templeBg from "@/assets/temple_lanterns.jpg";
import { Solar } from "lunar-javascript";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [interpretation, setInterpretation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [aiCategory, setAiCategory] = useState<string>("");
  const [aiSourceData, setAiSourceData] = useState<{
    hexagramName: string;
    fiveElements: string;
    fortune: string;
    direction: string;
    categoryInterpretation: string;
    coreCharacteristics: string;
  } | null>(null);
  const [aiPrompt, setAiPrompt] = useState<{
    system: string;
    user: string;
  } | null>(null);
  const { toast } = useToast();
  const { t, language } = useLanguage();

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
    setAiCategory("");
    setAiSourceData(null);
    setAiPrompt(null);
    try {
      // 將陽曆轉換為農曆
      const solar = Solar.fromYmd(data.year, data.month, data.day);
      const lunar = solar.getLunar();
      const lunarMonth = lunar.getMonth();
      const lunarDay = lunar.getDay();
      console.log(`陽曆: ${data.year}-${data.month}-${data.day} -> 農曆: ${lunarMonth}月${lunarDay}日`);

      // 檢測問題語言
      const questionLanguage = detectLanguage(data.question);

      // 使用農曆日期計算卦象
      const divinationResult = calculateXiaoLiuRen(lunarMonth, lunarDay, data.hour, questionLanguage);

      // 添加動畫延遲
      setTimeout(async () => {
        setResult(divinationResult);
        const isEnglish = questionLanguage === 'en';
        toast({
          title: isEnglish ? "Divination Complete" : "占卜完成",
          description: isEnglish ? `Lunar Date: ${lunarMonth}/${lunarDay} - Result: "${divinationResult.name}"` : `農曆: ${lunarMonth}月${lunarDay}日 - 得到「${divinationResult.name}」卦`
        });

        // 自動生成 AI 解讀
        await generateInterpretation(divinationResult, data.question);
      }, 1000);
    } catch (error) {
      console.error("日期轉換錯誤:", error);
      toast({
        title: t("日期轉換失敗", "Date Conversion Failed"),
        description: t("無法將陽曆轉換為農曆，請檢查輸入的日期是否正確", "Could not convert solar to lunar date. Please check the date."),
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const generateInterpretation = async (divinationResult: DivinationResult, question: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('interpret-divination', {
        body: {
          resultName: divinationResult.name,
          resultDescription: divinationResult.description,
          resultFortune: divinationResult.fortune,
          question: question
        }
      });
      if (error) throw error;
      if (data?.interpretation) {
        setInterpretation(data.interpretation);
        setAiCategory(data.category || "");
        setAiSourceData(data.sourceData || null);
        setAiPrompt(data.prompt || null);
      } else {
        throw new Error('未收到有效的解讀結果');
      }
    } catch (error) {
      console.error("AI 解讀失敗:", error);
      toast({
        title: t("AI 解讀失敗", "AI Interpretation Failed"),
        description: error instanceof Error ? error.message : t("無法生成智慧解讀，請稍後再試", "Could not generate interpretation. Please try again."),
        variant: "destructive"
      });
      setInterpretation(t("暫時無法生成 AI 解讀，請稍後再試。您可以參考卦象的基本說明進行理解。", "AI interpretation is temporarily unavailable. Please refer to the basic hexagram description."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero Section with Background */}
      <main className="flex-1 bg-cover bg-center bg-no-repeat relative" style={{
        backgroundImage: `url(${templeBg})`
      }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        
        <div id="divination" className="container max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12 space-y-6 sm:space-y-8 relative z-10">
          {/* Hero Title */}
          <div className="text-center space-y-3 sm:space-y-4 animate-in fade-in-50 slide-in-from-top-4 duration-700 px-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-jade/70 via-gold/80 to-cinnabar/70 bg-clip-text text-white/45">
              {t("小六壬占卜系統", "Xiao Liu Ren Divination System")}
            </h1>
            <p className="text-white text-base sm:text-lg leading-relaxed">
              {t("傳統智慧 × 貼身解讀 · 精確提議，讓你選擇", "Traditional Wisdom × Personalize Interpretation · Punctual Suggestions, Your Choice")}
            </p>
          </div>

          {/* Divination Form */}
          <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
            <DivinationForm onSubmit={handleDivination} isLoading={isLoading} />
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4 sm:space-y-6">
              <DivinationCard result={result} />
              <AIInterpretation interpretation={interpretation} isLoading={isLoading && !interpretation} />
            </div>
          )}

          {/* About Section */}
          <div id="about" className="animate-in fade-in-50 duration-700 delay-200 bg-background/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-border">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
              {t("關於小六壬", "About Xiao Liu Ren")}
            </h3>
            <div className="space-y-2 text-sm sm:text-base text-foreground/90">
              <p>
                {t(
                  "小六壬是中國傳統占卜術之一，相傳源於三國時期(AD220–AD280)傳奇軍師諸葛亮，以快速靈驗著稱。通過時間（月、日、時辰）推算六神位置，預測吉凶。",
                  "Xiao Liu Ren is a traditional Chinese divination method, believed to originate from the legendary strategic advisor Zhuge Liang during the Three Kingdoms period(AD220–AD280). Known for being quick in providing insights, it calculates the positions of six deities based on time (month, day, hour) to predict fortune and misfortune."
                )}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Email Subscribe */}
          <EmailSubscribe />

          {/* Copyright & Info */}
          <div className="text-center text-xs sm:text-sm text-muted-foreground pt-4 border-t">
            <p className="leading-relaxed">
              {t(
                "小六壬源自中國傳統術數，此系統僅供參考娛樂",
                "Xiao Liu Ren originates from traditional Chinese divination, this system is for reference and entertainment only"
              )}
            </p>
            <p className="mt-3 sm:mt-2 leading-relaxed">
              {t("✨ AI 智慧解讀 · 傳統與科技結合", "✨ AI Smart Interpretation · Bridging Tradition and Technology")}
            </p>
            <p className="mt-3 sm:mt-4">© 2026 Master Sun Sky</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
