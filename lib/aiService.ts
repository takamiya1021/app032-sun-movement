import type { SunPositionData, AIContent } from '@/types/sun';

/**
 * Google AI Studio API（Gemini）のエンドポイント
 */
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * 太陽の豆知識を生成するプロンプト
 */
export function generateSunTrivia(sunData: SunPositionData, cityName: string): string {
  const dateStr = sunData.date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `あなたは天文学と神話に詳しい専門家です。
${dateStr}の${cityName}の太陽（高度${sunData.altitude.toFixed(1)}度）について、
興味深い豆知識を1つ、150文字程度で教えてください。
太陽にまつわる神話・文化・科学的知識から選んでください。`;
}

/**
 * 太陽のメッセージを生成するプロンプト
 */
export function generateSunMessage(sunData: SunPositionData, cityName: string): string {
  const dateStr = sunData.date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 時間帯の判定
  let phaseName = '昼間';
  if (sunData.altitude < -6) {
    phaseName = '夜';
  } else if (sunData.altitude < 0) {
    phaseName = sunData.time < 12 ? '夜明け前' : '日没後';
  } else if (sunData.altitude < 6) {
    phaseName = sunData.time < 12 ? '朝焼け' : '夕焼け';
  }

  return `あなたは太陽と自然に詳しいアドバイザーです。
${dateStr}、${cityName}での太陽（${phaseName}）について、
前向きで心地よいメッセージを100文字程度で伝えてください。`;
}

/**
 * 紫外線対策アドバイスを生成するプロンプト
 */
export function generateUVAdvice(sunData: SunPositionData, cityName: string): string {
  const dateStr = sunData.date.toLocaleDateString('ja-JP', {
    month: 'long',
  });
  const hour = Math.floor(sunData.time);

  return `あなたは皮膚科医です。
${dateStr}、時刻${hour}時頃の太陽高度${sunData.altitude.toFixed(1)}度での
紫外線対策アドバイスを100文字程度で教えてください。
季節・時間帯を考慮してください。`;
}

/**
 * 写真撮影タイミングを生成するプロンプト
 */
export function generatePhotoTiming(sunData: SunPositionData, cityName: string): string {
  const dateStr = sunData.date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sunriseTime = `${sunData.sunrise.getHours()}:${sunData.sunrise.getMinutes().toString().padStart(2, '0')}`;
  const sunsetTime = `${sunData.sunset.getHours()}:${sunData.sunset.getMinutes().toString().padStart(2, '0')}`;

  return `あなたはプロカメラマンです。
${dateStr}、${cityName}での撮影について、
- 日の出時刻: ${sunriseTime}
- 日の入り時刻: ${sunsetTime}
を踏まえ、ゴールデンアワー・マジックアワーの
ベストタイミングを100文字程度で提案してください。`;
}

/**
 * Gemini APIを呼び出してテキストを生成
 */
async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API呼び出しエラー: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  if (data.candidates && data.candidates.length > 0) {
    const content = data.candidates[0].content;
    if (content && content.parts && content.parts.length > 0) {
      return content.parts[0].text || '';
    }
  }

  throw new Error('APIレスポンスが不正です');
}

/**
 * 全ての太陽コンテンツを生成
 */
export async function generateAllSunContent(
  sunData: SunPositionData,
  cityName: string,
  apiKey: string
): Promise<AIContent> {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('APIキーが設定されていません');
  }

  try {
    // 並列で4つのコンテンツを生成
    const [trivia, message, uvAdvice, photoTiming] = await Promise.all([
      callGeminiAPI(generateSunTrivia(sunData, cityName), apiKey),
      callGeminiAPI(generateSunMessage(sunData, cityName), apiKey),
      callGeminiAPI(generateUVAdvice(sunData, cityName), apiKey),
      callGeminiAPI(generatePhotoTiming(sunData, cityName), apiKey),
    ]);

    return {
      trivia,
      message,
      uvAdvice,
      photoTiming,
      generatedAt: new Date(),
    };
  } catch (error) {
    // エラーを再スロー
    throw error;
  }
}
