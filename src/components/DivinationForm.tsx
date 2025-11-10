import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { TRADITIONAL_HOURS, modernHourToTraditional } from "@/lib/xiaoliu";
import { Sparkles } from "lucide-react";
import { Solar } from "lunar-javascript";

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
      setLunarDate("日期無效");
    }
  }, [year, month, day]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ year, month, day, hour, question });
  };

  const useCurrentTime = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setDay(now.getDate());
    setHour(modernHourToTraditional(now.getHours()));
  };

  return (
    <Card className="p-6 shadow-soft bg-card/70 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="question" className="text-lg font-semibold">
            <div>Enter Your Question</div>
            <div className="text-base">請輸入您的問題</div>
          </Label>
          <Textarea
            id="question"
            placeholder="e.g., What is my fortune today? / 例如：今日財運如何？"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Label className="text-base">
              <div>Select Solar Date & Time</div>
              <div className="text-sm">選擇陽曆時間</div>
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={useCurrentTime}
              className="text-xs whitespace-nowrap"
            >
              Use Current Time / 使用當前時間
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label htmlFor="year" className="text-sm">
                Year / 年份
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
                Month / 月份
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
                Day / 日期
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
                Hour / 時辰
              </Label>
              <Select
                value={hour.toString()}
                onValueChange={(value) => setHour(parseInt(value))}
              >
                <SelectTrigger id="hour">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start" className="max-h-[300px]">
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
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="text-sm text-muted-foreground mb-1">
              <div>Corresponding Lunar Date:</div>
              <div>對應農曆日期：</div>
            </div>
            <div className="text-base font-semibold text-primary">{lunarDate}</div>
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
              Divining... / 占卜中...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Start Divination / 開始占卜
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
}
