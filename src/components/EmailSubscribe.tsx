import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";
import { z } from "zod";

// Email validation schema
const emailSchema = z.string()
  .trim()
  .min(1, "請輸入電子郵件")
  .email("請輸入有效的電子郵件")
  .max(255, "電子郵件過長");

// Rate limiting: track last submission time
const RATE_LIMIT_MS = 10000; // 10 seconds between submissions

export const EmailSubscribe = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // Honeypot field - should remain empty
  const lastSubmitRef = useRef<number>(0);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check - if filled, silently reject (bot detected)
    if (honeypot) {
      // Pretend success to confuse bots
      toast({
        title: "訂閱成功！",
        description: "感謝您的訂閱 / Thank you for subscribing!",
      });
      setEmail("");
      return;
    }

    // Client-side rate limiting
    const now = Date.now();
    if (now - lastSubmitRef.current < RATE_LIMIT_MS) {
      toast({
        title: "請稍後再試",
        description: "Please wait a moment before trying again",
        variant: "destructive",
      });
      return;
    }

    // Validate email with zod
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      toast({
        title: "請輸入有效的電子郵件",
        description: validation.error.errors[0]?.message || "Invalid email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    lastSubmitRef.current = now;

    try {
      const { error } = await supabase
        .from("email_subscribers")
        .insert([{ email: validation.data.toLowerCase() }]);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "此電子郵件已訂閱",
            description: "This email is already subscribed",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "訂閱成功！",
          description: "感謝您的訂閱 / Thank you for subscribing!",
        });
        setEmail("");
      }
    } catch (error) {
      console.error("Subscription failed");
      toast({
        title: "訂閱失敗",
        description: "請稍後再試 / Please try again later",
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
          訂閱占卜通訊
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground px-2">
          Subscribe for divination updates and insights
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
          disabled={isLoading}
          className="flex-1 text-sm sm:text-base"
          maxLength={255}
        />
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto text-sm sm:text-base">
          {isLoading ? "訂閱中..." : "訂閱"}
        </Button>
      </form>
    </div>
  );
};
