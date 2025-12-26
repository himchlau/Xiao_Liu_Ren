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

// 問題分類關鍵詞
const categoryKeywords: Record<string, string[]> = {
  "事業財運": ["工作", "事業", "財運", "財富", "金錢", "賺錢", "投資", "生意", "職場", "升職", "加薪", "收入", "股票", "創業", "公司", "老闆", "同事", "工資", "薪水", "理財", "買賣", "career", "job", "money", "finance", "investment", "business", "promotion", "salary", "work", "wealth", "income"],
  "感情婚姻": ["感情", "愛情", "婚姻", "結婚", "戀愛", "對象", "伴侶", "男友", "女友", "老公", "老婆", "丈夫", "妻子", "分手", "復合", "桃花", "相親", "約會", "追求", "暗戀", "love", "relationship", "marriage", "dating", "boyfriend", "girlfriend", "husband", "wife", "romance", "breakup"],
  "健康疾病": ["健康", "疾病", "生病", "身體", "醫院", "看病", "檢查", "手術", "康復", "痊癒", "病情", "治療", "藥物", "症狀", "health", "illness", "disease", "sick", "hospital", "doctor", "medical", "surgery", "recovery", "treatment"],
  "失物方位": ["丟失", "遺失", "找東西", "失物", "丟東西", "找回", "尋找", "不見", "找不到", "遺落", "掉了", "lost", "find", "missing", "where", "locate", "search"],
  "出行吉凶": ["出行", "旅行", "出門", "外出", "旅遊", "出差", "搬家", "移居", "遷移", "飛機", "坐車", "交通", "travel", "trip", "journey", "move", "relocate", "flight", "vacation", "abroad"],
  "簽約談判": ["簽約", "合同", "協議", "談判", "合作", "條款", "契約", "合夥", "協商", "洽談", "contract", "sign", "agreement", "negotiate", "deal", "partnership", "terms"],
  "官司訴訟": ["官司", "訴訟", "法院", "律師", "法律", "糾紛", "起訴", "被告", "原告", "判決", "lawsuit", "court", "legal", "lawyer", "sue", "case", "judge", "trial"],
  "家宅平安": ["家宅", "房子", "住宅", "家庭", "家人", "風水", "房屋", "裝修", "搬遷", "租房", "買房", "home", "house", "family", "feng shui", "residence", "property", "apartment"]
};

// 分類問題
function classifyQuestion(question: string): string | null {
  const lowerQuestion = question.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lowerQuestion.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  return null; // 無法歸類，使用核心特質
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

    // 獲取卦象詳細資料
    const hexagramData = xiaoLiuRenData[resultName] || {};
    
    // 分類問題
    const category = classifyQuestion(question);
    console.log('Question category:', category || '核心特質');

    // 構建解讀資料
    let categoryInterpretation = "";
    let categoryLabel = "";
    
    if (category && hexagramData[category]) {
      categoryInterpretation = hexagramData[category];
      categoryLabel = category;
    } else {
      categoryInterpretation = hexagramData["核心特質"] || resultDescription;
      categoryLabel = "核心特質";
    }

    const prompt = `You are a master of Xiao Liu Ren divination. Based on the following information, provide a professional and wise interpretation.

Divination Result: ${resultName}
Fortune Level: ${resultFortune}
Five Elements: ${hexagramData["五行"] || "未知"}
Direction: ${hexagramData["方位"] || "未知"}

User's Question (for context only, DO NOT repeat in response): ${question}

Category-Specific Interpretation from Traditional Text:
${categoryInterpretation}

Additional Reference - Core Characteristics:
${hexagramData["核心特質"] || resultDescription}

Please provide:
1. Explain the meaning of this hexagram (${resultName}) and its implications
2. Based on the traditional interpretation above, give specific advice
3. Key points to pay attention to and timing considerations

CRITICAL REQUIREMENTS:
- DO NOT repeat or mention the user's question in your response
- DO NOT mention or state what category the question belongs to
- You MUST respond in the SAME LANGUAGE as the question above. If the question is in English, respond in English. If in Japanese, respond in Japanese. If in Chinese, respond in Chinese.
- Your interpretation MUST be based on the traditional text provided above. Do not make up information.
- Use MODERN, EVERYDAY LANGUAGE that regular people use in daily conversations. Avoid overly formal or archaic expressions.
- For ENGLISH responses: Keep it to 200 words maximum.
- For CHINESE responses: Keep it to 300 characters maximum.
- Your tone should be warm, friendly, and conversational, like a wise friend giving practical advice.
- Jump directly into the interpretation without preamble.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a wise 50-year-old master of traditional Chinese divination, specializing in Xiao Liu Ren. Your interpretations are based on traditional texts and wisdom. IMPORTANT: Never repeat the user\'s question and never mention the category classification in your response. Always use modern, everyday language that regular people use in conversations - avoid overly formal or archaic expressions. Be warm and friendly like a wise friend. Jump directly into the interpretation.' },
          { role: 'user', content: prompt }
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
          hexagramName: resultName,
          fiveElements: hexagramData["五行"] || "未知",
          fortune: hexagramData["吉凶"] || resultFortune,
          direction: hexagramData["方位"] || "未知",
          categoryInterpretation: categoryInterpretation,
          coreCharacteristics: hexagramData["核心特質"] || resultDescription
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
