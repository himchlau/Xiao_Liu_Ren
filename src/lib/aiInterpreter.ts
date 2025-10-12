// 本地 AI 解讀功能
import { pipeline } from "@huggingface/transformers";

let textGenerator: any = null;
let isLoading = false;

/**
 * 初始化本地 AI 模型
 */
export async function initAI(onProgress?: (progress: number) => void): Promise<void> {
  if (textGenerator || isLoading) return;
  
  isLoading = true;
  
  try {
    // 使用輕量級的多語言模型
    textGenerator = await pipeline(
      "text-generation",
      "onnx-community/Qwen2.5-0.5B-Instruct",
      {
        device: "webgpu",
        dtype: "q4",
        progress_callback: (data: any) => {
          if (onProgress && data.progress) {
            onProgress(data.progress);
          }
        },
      }
    );
  } catch (error) {
    console.error("AI 初始化失敗:", error);
    throw new Error("AI 模型載入失敗，請確保您的瀏覽器支援 WebGPU");
  } finally {
    isLoading = false;
  }
}

/**
 * 使用 AI 解讀卦象
 */
export async function interpretDivination(
  result: string,
  question: string
): Promise<string> {
  if (!textGenerator) {
    await initAI();
  }

  const prompt = `你是一位精通小六壬占卜的大師。請根據以下資訊，提供專業而富有智慧的解讀。

占卜結果：${result}
問題：${question}

請提供：
1. 對這個卦象的整體解讀
2. 針對所問問題的具體建議
3. 需要注意的事項

請用繁體中文回答，語氣要莊重但易懂，約150字以內。`;

  try {
    const output = await textGenerator(prompt, {
      max_new_tokens: 200,
      temperature: 0.7,
      do_sample: true,
      top_p: 0.9,
    });

    return output[0].generated_text.replace(prompt, "").trim();
  } catch (error) {
    console.error("AI 解讀失敗:", error);
    return "暫時無法生成 AI 解讀，請稍後再試。您可以參考卦象的基本說明進行理解。";
  }
}

/**
 * 檢查 WebGPU 支援
 */
export async function checkWebGPUSupport(): Promise<boolean> {
  if (!('gpu' in navigator)) {
    return false;
  }
  
  try {
    const gpu = (navigator as any).gpu;
    const adapter = await gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}
