import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resultName, resultDescription, resultFortune, question } = await req.json();
    
    console.log('Interpreting divination:', { resultName, question });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `You are a master of Xiao Liu Ren divination. Based on the following information, provide a professional and wise interpretation.

Divination Result: ${resultName} (${resultFortune})
Hexagram Description: ${resultDescription}
Question: ${question}

Please provide:
1. Overall interpretation of this hexagram
2. Specific advice regarding the question
3. Things to pay attention to

CRITICAL: You MUST respond in the SAME LANGUAGE as the question above. If the question is in English, respond in English. If in Japanese, respond in Japanese. If in Chinese, respond in Chinese.

Your tone should be dignified yet understandable, around 150-200 words.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a wise 50-year-old master of traditional Chinese divination, specializing in Xiao Liu Ren. Your personality is conservative and thoughtful, drawing from years of experience. Your interpretations are insightful yet practical, balancing traditional wisdom with a measured, mature perspective. You speak with the calm authority of someone who has seen much in life.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: '請求過於頻繁，請稍後再試。' }), 
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: 'AI 解讀服務需要充值，請聯繫管理員。' }), 
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI 解讀服務暫時不可用');
    }

    const data = await response.json();
    const interpretation = data.choices?.[0]?.message?.content;

    if (!interpretation) {
      throw new Error('AI 未返回有效的解讀結果');
    }

    console.log('Interpretation generated successfully');

    return new Response(
      JSON.stringify({ interpretation }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in interpret-divination function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : '生成解讀時發生錯誤，請稍後再試。' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
