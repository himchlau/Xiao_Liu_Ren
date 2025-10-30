// 小六壬核心計算邏輯

export type DivinationResult = {
  name: string;
  position: number;
  description: string;
  fortune: string;
  color: string;
};

const POSITIONS_ZH = [
  {
    name: "大安",
    description: "身不動時，五行屬木，顏色青色，方位東方。臨青龍，謀事主一、五、七。",
    fortune: "大吉",
    color: "jade",
  },
  {
    name: "留連",
    description: "人未歸時，五行屬水，顏色黑色，方位北方。臨玄武，謀事主二、八、十。",
    fortune: "凶",
    color: "slate",
  },
  {
    name: "速喜",
    description: "人即至時，五行屬火，顏色紅色，方位南方。臨朱雀，謀事主三、六、九。",
    fortune: "大吉",
    color: "cinnabar",
  },
  {
    name: "赤口",
    description: "官事凶時，五行屬金，顏色白色，方位西方。臨白虎，謀事主四、七、十。",
    fortune: "凶",
    color: "gray",
  },
  {
    name: "小吉",
    description: "人來喜時，五行屬木，顏色青色，方位東方。臨六合，謀事主一、五、七。",
    fortune: "吉",
    color: "gold",
  },
  {
    name: "空亡",
    description: "音信稀時，五行屬土，顏色黃色，方位中央。臨勾陳，謀事主三、六、九。",
    fortune: "凶",
    color: "amber",
  },
];

const POSITIONS_EN = [
  {
    name: "Da An (Great Peace)",
    description: "Body at rest. Wood element, green color, east direction. Under Azure Dragon. Matters relate to 1, 5, 7.",
    fortune: "Very Auspicious",
    color: "jade",
  },
  {
    name: "Liu Lian (Delay)",
    description: "Person not yet returned. Water element, black color, north direction. Under Black Tortoise. Matters relate to 2, 8, 10.",
    fortune: "Inauspicious",
    color: "slate",
  },
  {
    name: "Su Xi (Swift Joy)",
    description: "Person arrives soon. Fire element, red color, south direction. Under Vermillion Bird. Matters relate to 3, 6, 9.",
    fortune: "Very Auspicious",
    color: "cinnabar",
  },
  {
    name: "Chi Kou (Red Mouth)",
    description: "Official troubles. Metal element, white color, west direction. Under White Tiger. Matters relate to 4, 7, 10.",
    fortune: "Inauspicious",
    color: "gray",
  },
  {
    name: "Xiao Ji (Small Fortune)",
    description: "Happy arrival. Wood element, green color, east direction. Under Six Harmony. Matters relate to 1, 5, 7.",
    fortune: "Auspicious",
    color: "gold",
  },
  {
    name: "Kong Wang (Emptiness)",
    description: "Scarce news. Earth element, yellow color, center direction. Under Hook Snake. Matters relate to 3, 6, 9.",
    fortune: "Inauspicious",
    color: "amber",
  },
];

/**
 * Detect language from text
 */
export function detectLanguage(text: string): 'zh' | 'en' {
  // Check for Chinese characters
  const chineseRegex = /[\u4e00-\u9fa5]/;
  return chineseRegex.test(text) ? 'zh' : 'en';
}

/**
 * 根據月、日、時辰計算小六壬卦象
 * @param month 農曆月份 (1-12)
 * @param day 農曆日期 (1-30)
 * @param hour 時辰 (1-12，子時為1)
 * @param language 語言 ('zh' | 'en')
 */
export function calculateXiaoLiuRen(
  month: number,
  day: number,
  hour: number,
  language: 'zh' | 'en' = 'zh'
): DivinationResult {
  // 月數日減1, 日數時減1, 大安由0開始算減1
  // 使用公式：(月 + 日 + 時 - 3) % 6
  const result = ((month + day + hour - 3) % 6);
  
  const positions = language === 'en' ? POSITIONS_EN : POSITIONS_ZH;
  
  return {
    ...positions[result],
    position: result + 1,
  };
}

/**
 * 將現代時間轉換為傳統時辰
 * @param hour 現代小時 (0-23)
 */
export function modernHourToTraditional(hour: number): number {
  const timeMap = [
    { start: 23, end: 1, traditional: 1 },  // 子時
    { start: 1, end: 3, traditional: 2 },   // 丑時
    { start: 3, end: 5, traditional: 3 },   // 寅時
    { start: 5, end: 7, traditional: 4 },   // 卯時
    { start: 7, end: 9, traditional: 5 },   // 辰時
    { start: 9, end: 11, traditional: 6 },  // 巳時
    { start: 11, end: 13, traditional: 7 }, // 午時
    { start: 13, end: 15, traditional: 8 }, // 未時
    { start: 15, end: 17, traditional: 9 }, // 申時
    { start: 17, end: 19, traditional: 10 },// 酉時
    { start: 19, end: 21, traditional: 11 },// 戌時
    { start: 21, end: 23, traditional: 12 },// 亥時
  ];

  for (const time of timeMap) {
    if (hour >= time.start && hour < time.end) {
      return time.traditional;
    }
    if (time.start === 23 && hour >= 23) {
      return time.traditional;
    }
  }
  
  return 1; // 默認子時
}

export const TRADITIONAL_HOURS = [
  { value: 1, label: "子時 (23:00-01:00)" },
  { value: 2, label: "丑時 (01:00-03:00)" },
  { value: 3, label: "寅時 (03:00-05:00)" },
  { value: 4, label: "卯時 (05:00-07:00)" },
  { value: 5, label: "辰時 (07:00-09:00)" },
  { value: 6, label: "巳時 (09:00-11:00)" },
  { value: 7, label: "午時 (11:00-13:00)" },
  { value: 8, label: "未時 (13:00-15:00)" },
  { value: 9, label: "申時 (15:00-17:00)" },
  { value: 10, label: "酉時 (17:00-19:00)" },
  { value: 11, label: "戌時 (19:00-21:00)" },
  { value: 12, label: "亥時 (21:00-23:00)" },
];
