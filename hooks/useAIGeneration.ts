'use client';

import { useState } from 'react';
import { generateAllSunContent } from '@/lib/aiService';
import type { SunPositionData, AIContent } from '@/types/sun';

/**
 * AI生成カスタムフック
 */
export function useAIGeneration() {
  const [content, setContent] = useState<AIContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * コンテンツを生成
   */
  const generate = async (
    sunData: SunPositionData,
    cityName: string,
    apiKey: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateAllSunContent(sunData, cityName, apiKey);
      setContent(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成に失敗しました';
      setError(errorMessage);
      setContent(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * コンテンツをクリア
   */
  const clear = () => {
    setContent(null);
    setError(null);
  };

  return {
    content,
    loading,
    error,
    generate,
    clear,
  };
}
