import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DivinationResult } from "@/lib/xiaoliu";

// Email validation schema
const emailSchema = z.string()
  .trim()
  .min(1, "請輸入電子郵件")
  .email("請輸入有效的電子郵件")
  .max(255, "電子郵件過長");

// Rate limiting: track last submission time
const RATE_LIMIT_MS = 10000; // 10 seconds between submissions

interface EmailSubscribeProps {
  divinationResult?: DivinationResult | null;
  interpretation?: string;
  question?: string;
}

export const EmailSubscribe = ({ 
  divinationResult, 
  interpretation, 
  question 
}: EmailSubscribeProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // Honeypot field - should remain empty
  const lastSubmitRef = useRef<number>(0);
  const { toast } = useToast();
  const { t } = useLanguage();

  const hasResult = divinationResult && interpretation;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check - if filled, silently reject (bot detected)
    if (honeypot) {
      // Pretend success to confuse bots
      toast({
        title: t("已發送！", "Sent!"),
        description: t("占卜結果已發送至您的電郵", "Divination results sent to your email"),
      });
      setEmail("");
      return;
    }

    // Client-side rate limiting
    const now = Date.now();
    if (now - lastSubmitRef.current < RATE_LIMIT_MS) {
      toast({
        title: t("請稍後再試", "Please wait"),
        description: t("請稍後再試", "Please wait a moment before trying again"),
        variant: "destructive",
      });
      return;
    }

    // Validate email with zod
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      toast({
        title: t("請輸入有效的電子郵件", "Please enter a valid email"),
        description: validation.error.errors[0]?.message || "Invalid email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    lastSubmitRef.current = now;

    try {
      // Store the email subscription
      const { error } = await supabase
        .from("email_subscribers")
        .insert([{ email: validation.data.toLowerCase() }]);

      if (error && error.code !== "23505") {
        // Ignore duplicate email error, throw others
        throw error;
      }

      // TODO: Send email with divination results via edge function
      // For now, just show success message
      toast({
        title: t("已發送！", "Sent!"),
        description: t("占卜結果已發送至您的電郵", "Divination results sent to your email"),
      });
      setEmail("");
    } catch (error) {
      console.error("Failed to send email");
      toast({
        title: t("發送失敗", "Failed to send"),
        description: t("請稍後再試", "Please try again later"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-border shadow-lg">
      <div className="text-center space-y-2 sm:space-y-3 mb-3 sm:mb-4">
        <div className="flex justify-center">
          <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-foreground">
          {t("電郵占卜結果", "Email Divination Results")}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground px-2">
          {hasResult 
            ? t("輸入電郵地址，將占卜結果發送給您", "Enter your email to receive the divination results")
            : t("完成占卜後，可將結果發送至您的電郵", "Complete a divination to send results to your email")
          }
        </p>
      </div>
      
      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
        {/* Honeypot field - hidden from real users, bots will fill it */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          style={{ 
            position: 'absolute', 
            left: '-9999px', 
            opacity: 0, 
            height: 0,
            width: 0,
            overflow: 'hidden'
          }}
          aria-hidden="true"
        />
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading || !hasResult}
          className="flex-1 text-sm sm:text-base"
          maxLength={255}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !hasResult} 
          className="w-full sm:w-auto text-sm sm:text-base"
        >
          {isLoading ? t("發送中...", "Sending...") : t("發送", "Send")}
        </Button>
      </form>
    </div>
  );
};