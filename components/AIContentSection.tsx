'use client';

import type { AIContent } from '@/types/sun';

interface AIContentSectionProps {
  content: AIContent | null;
  error: string | null;
}

/**
 * AI生成コンテンツ表示セクション
 */
export default function AIContentSection({ content, error }: AIContentSectionProps) {
  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
        <h3 className="text-lg font-bold text-red-800 mb-2">❌ エラー</h3>
        <p className="text-red-700">{error}</p>
        <p className="text-sm text-red-600 mt-2">
          APIキーが正しく設定されているか確認してください。
        </p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 text-center">
        <p className="text-gray-600">
          「✨ AI情報を生成」ボタンを押すと、太陽に関する情報が表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 豆知識 */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
          💡 豆知識
        </h3>
        <p className="text-gray-800 leading-relaxed">{content.trivia}</p>
      </div>

      {/* 今日のメッセージ */}
      <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
        <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center">
          🔮 今日のメッセージ
        </h3>
        <p className="text-gray-800 leading-relaxed">{content.message}</p>
      </div>

      {/* 日焼け対策 */}
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
        <h3 className="text-lg font-bold text-orange-800 mb-3 flex items-center">
          🧴 日焼け対策
        </h3>
        <p className="text-gray-800 leading-relaxed">{content.uvAdvice}</p>
      </div>

      {/* 撮影ベストタイミング */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
        <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center">
          📸 撮影ベストタイミング
        </h3>
        <p className="text-gray-800 leading-relaxed">{content.photoTiming}</p>
      </div>

      {/* 生成日時 */}
      <div className="text-center text-xs text-gray-500">
        生成日時: {content.generatedAt.toLocaleString('ja-JP')}
      </div>
    </div>
  );
}
