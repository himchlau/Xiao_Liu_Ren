import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { TRADITIONAL_HOURS, modernHourToTraditional } from "@/lib/xiaoliu";
import { Sparkles } from "lucide-react";
import { Solar } from "lunar-javascript";
import { useLanguage } from "@/contexts/LanguageContext";

interface DivinationFormProps {
  onSubmit: (data: {
    year: number;
    month: number;
    day: number;
    hour: number;
    question: string;
  }) => void;
  isLoading?: boolean;
}

export function DivinationForm({ onSubmit, isLoading }: DivinationFormProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [day, setDay] = useState(now.getDate());
  const [hour, setHour] = useState(modernHourToTraditional(now.getHours()));
  const [question, setQuestion] = useState("");
  const [lunarDate, setLunarDate] = useState("");
  const { t, language } = useLanguage();

  // 計算並更新農曆日期
  useEffect(() => {
    try {
      const solar = Solar.fromYmd(year, month, day);
      const lunar = solar.getLunar();
      const lunarMonth = lunar.getMonth();
      const lunarDay = lunar.getDay();
      const lunarYear = lunar.getYear();
      const yearInChinese = lunar.getYearInChinese();
      const monthInChinese = lunar.getMonthInChinese();
      const dayInChinese = lunar.getDayInChinese();
      setLunarDate(`${yearInChinese}年 ${monthInChinese}月${dayInChinese} (${lunarYear}-${lunarMonth}-${lunarDay})`);
    } catch (error) {
      setLunarDate(t("日期無效", "Invalid date"));
    }
  }, [year, month, day, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      year,
      month,
      day,
      hour,
      question
    });
  };

  const useCurrentTime = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setDay(now.getDate());
    setHour(modernHourToTraditional(now.getHours()));
  };

  return (
    <Card className="p-4 sm:p-6 shadow-soft bg-card/70 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="space-y-2">
          <Label htmlFor="question" className="text-base sm:text-lg font-semibold">
            {t("請輸入您的問題", "Please Enter Your Question")}
          </Label>
          <Textarea
            id="question"
            placeholder={t("例如：今日財運如何？", "e.g., What is my fortune today?")}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="min-h-[80px] sm:min-h-[100px] resize-none text-sm sm:text-base"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Label className="text-sm sm:text-base">
              {t("選擇陽曆時間", "Select Solar Date & Time")}
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={useCurrentTime}
              className="text-xs sm:text-sm whitespace-nowrap h-8 sm:h-9 px-2 sm:px-3"
            >
              {t("使用當前時間", "Use Current Time")}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            <div className="space-y-2">
              <Label htmlFor="year" className="text-sm">
                {t("年份", "Year")}
              </Label>
              <Input
                id="year"
                type="number"
                min="1900"
                max="2100"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="month" className="text-sm">
                {t("月份", "Month")}
              </Label>
              <Input
                id="month"
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="day" className="text-sm">
                {t("日期", "Day")}
              </Label>
              <Input
                id="day"
                type="number"
                min="1"
                max="31"
                value={day}
                onChange={(e) => setDay(parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hour" className="text-sm">
                {t("時辰", "Hour")}
              </Label>
              <Select value={hour.toString()} onValueChange={(value) => setHour(parseInt(value))}>
                <SelectTrigger id="hour">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="end"
                  side="bottom"
                  className="max-h-[300px] w-[var(--radix-select-trigger-width)]"
                  sideOffset={4}
                >
                  {TRADITIONAL_HOURS.map((h) => (
                    <SelectItem key={h.value} value={h.value.toString()}>
                      {h.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 顯示農曆日期 */}
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">
              {t("對應農曆日期：", "Corresponding Lunar Date:")}
            </div>
            <div className="text-sm sm:text-base font-semibold text-primary break-words">
              {lunarDate}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-jade to-gold hover:opacity-90 transition-opacity"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              {t("占卜中...", "Divining...")}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {t("開始占卜", "Start Divination")}
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
}
