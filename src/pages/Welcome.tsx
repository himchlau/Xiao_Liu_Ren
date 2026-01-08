import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import templeLanterns from "@/assets/temple_lanterns.jpg";
import { Sparkles } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required / 請輸入電子郵件" })
    .email({ message: "Invalid email address / 無效的電子郵件地址" })
    .max(255, { message: "Email must be less than 255 characters / 電子郵件必須少於255個字符" }),
  // Honeypot field - should always be empty
  website: z.string().max(0).optional(),
});

// Rate limiting: track last submission time
const RATE_LIMIT_MS = 10000; // 10 seconds between submissions

const Welcome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const lastSubmitRef = useRef<number>(0);
  
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
      website: "", // Honeypot
    },
  });

  const handleSubmit = async (values: z.infer<typeof emailSchema>) => {
    // Honeypot check - if filled, silently redirect (bot detected)
    if (values.website && values.website.length > 0) {
      // Pretend success to confuse bots
      toast({
        title: "Welcome!",
        description: "Your email has been saved successfully.",
      });
      navigate("/divination");
      return;
    }

    // Client-side rate limiting
    const now = Date.now();
    if (now - lastSubmitRef.current < RATE_LIMIT_MS) {
      toast({
        title: "Please wait",
        description: "Please wait a moment before trying again / 請稍後再試",
        variant: "destructive",
      });
      return;
    }
    lastSubmitRef.current = now;

    try {
      const { error } = await supabase
        .from("email_subscribers")
        .insert([{ email: values.email.toLowerCase() }]);

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
      console.error("Email submission failed");
      toast({
        title: "Error",
        description: "Failed to save email. Please try again.",
        variant: "destructive",
      });
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Honeypot field - hidden from real users */}
              <div 
                style={{ 
                  position: 'absolute', 
                  left: '-9999px', 
                  opacity: 0, 
                  height: 0,
                  width: 0,
                  overflow: 'hidden'
                }}
                aria-hidden="true"
              >
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email" className="text-lg font-semibold">
                      <div>Enter Your Email</div>
                      <div className="text-base">輸入您的電子郵件</div>
                    </Label>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="text-base"
                        maxLength={255}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Get started with your divination journey
                      <br />
                      開始您的占卜之旅
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full text-lg py-6"
              >
                {form.formState.isSubmitting ? (
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
          </Form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/divination")}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Skip and continue / 跳過並繼續
            </button>
          </div>
        </div>
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2023 Sun Sky
        </p>
      </div>
    </div>
  );
};

export default Welcome;
