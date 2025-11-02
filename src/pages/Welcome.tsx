import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import templeLanterns from "@/assets/temple_lanterns.jpg";
import { Sparkles } from "lucide-react";

const Welcome = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("email_subscribers")
        .insert([{ email }]);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Subscribed",
            description: "This email is already registered. Welcome back!",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Welcome!",
          description: "Your email has been saved successfully.",
        });
      }

      navigate("/divination");
    } catch (error) {
      console.error("Error saving email:", error);
      toast({
        title: "Error",
        description: "Failed to save email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${templeLanterns})` }}
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Xiao Liu Ren Divination System
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-white/90 mb-4">
            小六壬占卜系統
          </h2>
          <p className="text-lg text-white/80 mb-2">
            Traditional Wisdom × AI Interpretation
          </p>
          <p className="text-lg text-white/80">
            傳統智慧 × AI解讀 · 掌中玄機，即刻洞察
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg font-semibold">
                <div>Enter Your Email</div>
                <div className="text-base">輸入您的電子郵件</div>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base"
              />
              <p className="text-sm text-muted-foreground">
                Get started with your divination journey
                <br />
                開始您的占卜之旅
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-lg py-6"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Loading... / 載入中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Continue to Divination / 繼續占卜
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/divination")}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Skip and continue / 跳過並繼續
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
