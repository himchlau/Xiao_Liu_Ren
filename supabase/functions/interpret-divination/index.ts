import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 小六壬詳細解讀資料
const xiaoLiuRenData: Record<string, Record<string, string>> = {
  "大安": {
    "五行": "木",
    "吉凶": "大吉",
    "方位": "東方",
    "核心特質": "安定、平穩、宜守成",
    "事業財運": "宜守成，穩中求進；忌冒進擴張。易得人助但忌鋒芒過露。主正財。投資需謹慎，投資不動產較佳。",
    "感情婚姻": "感情穩定但缺激情，婚姻牢固，女性占更吉。",
    "健康疾病": "肝膽、頭頂問題；無大礙但防過勞或飲食不潔。",
    "失物方位": "近地或家中，西南方尋。",
    "出行吉凶": "宜近行；遠行不利，防意外。",
    "簽約談判": "宜親友合作；文書穩妥。",
    "官司訴訟": "宜人調解，宜守。",
    "家宅平安": "宅舍安康；風水無礙。"
  },
  "留連": {
    "五行": "水",
    "吉凶": "小凶",
    "方位": "北方",
    "核心特質": "拖延、糾纏、退緩阻滯",
    "事業財運": "職場小人多；項目拖延；求財易破；避免灰色收入或合夥陷阱。",
    "感情婚姻": "冷戰、溝通不暢；一方強勢；宜耐心化解。",
    "健康疾病": "胃腸病、精神壓力；病程延滯難愈。",
    "失物方位": "南方或水邊，被遮蓋較難尋覓。",
    "出行吉凶": "多有吉成；易破財。",
    "簽約談判": "反覆難成；細節易糾紛。",
    "官司訴訟": "拖延無果不定；證據不足。",
    "家宅平安": "陰煞沖犯（女性鬼神）。"
  },
  "速喜": {
    "五行": "火",
    "吉凶": "中吉",
    "方位": "南方",
    "核心特質": "快速、喜慶、時機成熟",
    "事業財運": "宜短期合作／快錢類職業，如銷售、傳媒；利南方求財，但需速戰速決。",
    "感情婚姻": "閃戀或快速復合；久戀易生口角變化；主動行動可成。",
    "健康疾病": "心臟血管／頭部急症；康復快但需防突發。",
    "失物方位": "南方／西南方；路上向女性問線索。",
    "出行吉凶": "順利且得利；忌拖延。",
    "簽約談判": "快速敲定；拖延則敗。",
    "官司訴訟": "得理速勝；忌糾纏。",
    "家宅平安": "舊病可愈；口舌自消。"
  },
  "赤口": {
    "五行": "金",
    "吉凶": "中凶",
    "方位": "西方",
    "核心特質": "口舌、官非、血光之災",
    "事業財運": "競爭激烈易糾紛；金融業或武職較有利；文職不利。",
    "感情婚姻": "爭拗頻繁；女方健康或為分手點；忌衝動分手。",
    "健康疾病": "外傷、呼吸道疾病；防流行病症。",
    "失物方位": "東南／西南方；恐因女性因素而尋回困難。",
    "出行吉凶": "防車禍、口角；向西方可行。",
    "簽約談判": "口舌之爭；武職方有利。",
    "官司訴訟": "大凶；防刑傷。",
    "家宅平安": "雞犬不守；防口舌。"
  },
  "小吉": {
    "五行": "水／木",
    "吉凶": "小吉",
    "方位": "西南",
    "核心特質": "和合、小成、貴人相助",
    "事業財運": "人際關係來財；如中介、介紹；合作財旺；西南方利收益。",
    "感情婚姻": "介紹成良緣；現有關係和諧；利婚嫁。",
    "健康疾病": "肝膽小疾；情緒波動影響消化。",
    "失物方位": "西南方，衣物處易找回。",
    "出行吉凶": "一路順遂；忌借貸。",
    "簽約談判": "貴人助成；注意條款漏洞。",
    "官司訴訟": "和解為貴；消散之兆。",
    "家宅平安": "六畜吉；人口平和。"
  },
  "空亡": {
    "五行": "土",
    "吉凶": "大凶",
    "方位": "中央",
    "核心特質": "落空、無果、陰煞干擾",
    "事業財運": "勞而無獲；需防騙局；宜大企業但職位虛懸；遠調不利。",
    "感情婚姻": "外人介入或感情無疾而終；二婚率較高。",
    "健康疾病": "脾胃失調；神經系統疾病；易沖陰煞或暗病。",
    "失物方位": "難尋回、被別人藏匿。",
    "出行吉凶": "大凶；改期最佳。",
    "簽約談判": "合約落空或暗藏陷阱。",
    "官司訴訟": "冤屈難伸。",
    "家宅平安": "陽宅出問題；需禳解。"
  }
};

// 英文卦名映射到中文
const englishToChineseMapping: Record<string, string> = {
  "Da An (Great Peace)": "大安",
  "Liu Lian (Delay)": "留連",
  "Su Xi (Swift Joy)": "速喜",
  "Chi Kou (Red Mouth)": "赤口",
  "Xiao Ji (Small Fortune)": "小吉",
  "Kong Wang (Emptiness)": "空亡"
};

// 有效的問題分類
const VALID_CATEGORIES = [
  "事業財運",
  "感情婚姻", 
  "健康疾病",
  "失物方位",
  "出行吉凶",
  "簽約談判",
  "官司訴訟",
  "家宅平安"
];

// 使用 AI 分類問題
async function classifyQuestionWithAI(question: string, apiKey: string): Promise<string> {
  const classificationPrompt = `You are a question classifier for Chinese divination. Analyze the user's question and classify it into ONE of these categories:

1. 事業財運 - Career, job, money, finance, investment, business, promotion, salary, income, wealth
2. 感情婚姻 - Love, relationship, marriage, dating, romance, partner, spouse, breakup
3. 健康疾病 - Health, illness, disease, medical, hospital, doctor, surgery, physical condition, checkup, wellness
4. 失物方位 - Lost items, finding things, missing objects, locating belongings
5. 出行吉凶 - Travel, trip, journey, moving, relocation, transportation, vacation
6. 簽約談判 - Contracts, agreements, negotiations, deals, partnerships, signing documents
7. 官司訴訟 - Lawsuits, legal matters, court, lawyers, disputes, litigation
8. 家宅平安 - Home, house, family, feng shui, residence, property, living situation

User's question: "${question}"

IMPORTANT: 
- Respond with ONLY the category name in Chinese (e.g., "健康疾病")
- If the question doesn't clearly fit any category, respond with "核心特質"
- Do not add any explanation or other text`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'user', content: classificationPrompt }
        ],
        temperature: 0.1,
        max_tokens: 20,
      }),
    });

    if (!response.ok) {
      console.error('Classification API error:', response.status);
      return "核心特質";
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() || "核心特質";
    
    // Validate the result is a valid category
    if (VALID_CATEGORIES.includes(result)) {
      return result;
    }
    
    return "核心特質";
  } catch (error) {
    console.error('Error classifying question:', error);
    return "核心特質";
  }
}

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

    // 將英文卦名轉換為中文以查找資料
    const chineseResultName = englishToChineseMapping[resultName] || resultName;
    console.log('Chinese hexagram name:', chineseResultName);

    // 獲取卦象詳細資料
    const hexagramData = xiaoLiuRenData[chineseResultName] || {};
    
    // 使用 AI 分類問題
    const category = await classifyQuestionWithAI(question, LOVABLE_API_KEY);
    console.log('AI classified question category:', category);

    // 構建解讀資料
    let categoryInterpretation = "";
    let categoryLabel = category;
    
    if (category !== "核心特質" && hexagramData[category]) {
      categoryInterpretation = hexagramData[category];
    } else {
      categoryInterpretation = hexagramData["核心特質"] || resultDescription;
      categoryLabel = "核心特質";
    }

    const systemPrompt = 'You are a wise 50-year-old master of traditional Chinese divination, specializing in Xiao Liu Ren. Your interpretations are based on traditional texts and wisdom. CRITICAL: Your primary goal is to DIRECTLY ADDRESS the user\'s specific question using the hexagram wisdom. Never repeat the question verbatim, but your entire response must be a clear answer to what they asked. Use modern, conversational language like a wise friend giving practical advice.';

    const userPrompt = `You are a master of Xiao Liu Ren divination. The user has asked a specific question and received a hexagram. Your job is to DIRECTLY ANSWER their question using the hexagram's wisdom.

USER'S QUESTION: ${question}

HEXAGRAM RESULT:
- Name: ${resultName}
- Fortune Level: ${resultFortune}
- Five Elements: ${hexagramData["五行"] || "Unknown"}
- Direction: ${hexagramData["方位"] || "Unknown"}

TRADITIONAL INTERPRETATION (use this to answer the question):
${categoryInterpretation}

CORE CHARACTERISTICS:
${hexagramData["核心特質"] || resultDescription}

YOUR TASK:
Provide a focused interpretation that DIRECTLY ADDRESSES the user's question above. Structure your response as follows:

1. DIRECT ANSWER: Start with a clear, direct answer to what they asked. What does the hexagram say about their specific situation?

2. PRACTICAL GUIDANCE: Based on the traditional interpretation, give them specific, actionable advice that applies to their question.

3. KEY TIMING/CONSIDERATIONS: Mention any timing factors or important points they should watch for, relevant to their question.

REQUIREMENTS:
- Your ENTIRE response must be focused on answering their specific question - not generic hexagram meanings
- DO NOT repeat the question word-for-word, but make it obvious you are addressing it
- DO NOT mention the category classification
- Respond in the SAME LANGUAGE as the question (English for English, Chinese for Chinese, etc.)
- Keep it concise: 200 words max for English, 300 characters max for Chinese
- Use warm, conversational language like a trusted advisor
- Base your interpretation on the traditional text provided above`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 600,
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

    console.log('Interpretation generated successfully for category:', categoryLabel);

    return new Response(
      JSON.stringify({ 
        interpretation,
        category: categoryLabel,
        sourceData: {
          hexagramName: chineseResultName,
          hexagramNameOriginal: resultName,
          fiveElements: hexagramData["五行"] || "未知",
          fortune: hexagramData["吉凶"] || resultFortune,
          direction: hexagramData["方位"] || "未知",
          categoryInterpretation: categoryInterpretation,
          coreCharacteristics: hexagramData["核心特質"] || resultDescription
        },
        prompt: {
          system: systemPrompt,
          user: userPrompt
        }
      }),
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
