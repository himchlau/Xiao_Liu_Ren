import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";

export const EmailSubscribe = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast({
        title: "請輸入有效的電子郵件",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("email_subscribers")
        .insert([{ email: email.trim().toLowerCase() }]);

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
      console.error("訂閱失敗:", error);
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
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="flex-1 text-sm sm:text-base"
        />
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto text-sm sm:text-base">
          {isLoading ? "訂閱中..." : "訂閱"}
        </Button>
      </form>
    </div>
  );
};
