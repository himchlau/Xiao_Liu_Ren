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

    const prompt = `你是一位精通小六壬占卜的大師。請根據以下資訊，提供專業而富有智慧的解讀。

占卜結果：${resultName}（${resultFortune}）
卦象說明：${resultDescription}
問題：${question}

請提供：
1. 對這個卦象的整體解讀
2. 針對所問問題的具體建議
3. 需要注意的事項

重要：請用與問題相同的語言回答（如果問題是英文就用英文，日文就用日文，中文就用中文）。語氣要莊重但易懂，約150-200字。`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: '你是一位精通中國傳統占卜的大師，特別擅長小六壬占卜。你的解讀深入淺出，既有傳統智慧又貼近現代生活。' },
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
