import { useState } from "react";
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
            請輸入您的問題
          </Label>
          <Textarea
            id="question"
            placeholder="例如：今日財運如何？"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base">選擇陽曆時間</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={useCurrentTime}
              className="text-xs"
            >
              使用當前時間
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">年份</Label>
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
              <Label htmlFor="month">月份</Label>
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
              <Label htmlFor="day">日期</Label>
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
              <Label htmlFor="hour">時辰</Label>
              <Select
                value={hour.toString()}
                onValueChange={(value) => setHour(parseInt(value))}
              >
                <SelectTrigger id="hour">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRADITIONAL_HOURS.map((h) => (
                    <SelectItem key={h.value} value={h.value.toString()}>
                      {h.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              占卜中...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              開始占卜
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
}
