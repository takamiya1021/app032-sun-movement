'use client';

import { useState, useEffect, useMemo } from 'react';
import SunCanvas from '@/components/SunCanvas';
import TimeSlider from '@/components/TimeSlider';
import AnimationControls from '@/components/AnimationControls';
import LocationSelector from '@/components/LocationSelector';
import SunInfo from '@/components/SunInfo';
import GenerateButton from '@/components/GenerateButton';
import AIContentSection from '@/components/AIContentSection';
import { useSunPosition } from '@/hooks/useSunPosition';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { MAJOR_CITIES } from '@/lib/cities';
import type { City } from '@/lib/cities';

export default function Home() {
  // デフォルトは東京
  const [selectedCity, setSelectedCity] = useState<City>(MAJOR_CITIES[0]);
  const [date, setDate] = useState<Date>(new Date());
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [viewAzimuth, setViewAzimuth] = useState(180);
  const [followSun, setFollowSun] = useState(false);

  // 太陽位置計算フック
  const {
    time,
    latitude,
    longitude,
    sunData,
    polarCondition,
    setTime,
    setLocation,
  } = useSunPosition(date, undefined, selectedCity.latitude, selectedCity.longitude);

  // AI生成フック
  const { content, loading, error, generate } = useAIGeneration();

  // ローカルストレージからAPIキーを読み込み
  useEffect(() => {
    const savedApiKey = localStorage.getItem('sun-app-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // APIキーをローカルストレージに保存
  const handleApiKeySave = () => {
    localStorage.setItem('sun-app-api-key', apiKey);
    setShowApiKeyInput(false);
    alert('APIキーを保存しました');
  };

  // 都市選択ハンドラ
  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setLocation(city.latitude, city.longitude);
  };

  // カスタム位置ハンドラ
  const handleCustomLocation = (lat: number, lon: number) => {
    setLocation(lat, lon);
  };

  // 日付変更ハンドラ
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setDate(newDate);
    }
  };

  // AI生成ハンドラ
  const handleGenerate = () => {
    if (!apiKey || apiKey.trim() === '') {
      alert('APIキーを設定してください');
      setShowApiKeyInput(true);
      return;
    }
    generate(sunData, selectedCity.name, apiKey);
  };

  // 日付フォーマット（YYYY-MM-DD）
  const formatDateForInput = (d: Date) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formattedDirection = useMemo(() => {
    const labels = ['北', '北東', '東', '南東', '南', '南西', '西', '北西'];
    const index = Math.round(viewAzimuth / 45) % labels.length;
    return labels[index];
  }, [viewAzimuth]);

  // 追従モード: 太陽方位に視点を合わせる
  useEffect(() => {
    if (!followSun) return;
    const targetAzimuth = ((sunData.azimuth % 360) + 360) % 360;
    setViewAzimuth((prev) => {
      const diff = Math.abs(prev - targetAzimuth);
      if (diff < 0.1) {
        return prev;
      }
      return targetAzimuth;
    });
  }, [followSun, sunData.azimuth]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            ☀️ 太陽の動き表示
          </h1>
          <p className="text-gray-600">
            世界各地の太陽の動きをビジュアル化
          </p>
        </div>

        {/* APIキー設定ボタン */}
        <div className="text-center">
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {showApiKeyInput ? '設定を閉じる' : '⚙️ APIキー設定'}
          </button>
        </div>

        {/* APIキー入力 */}
        {showApiKeyInput && (
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            <h3 className="font-bold text-gray-800">Google AI Studio APIキー設定</h3>
            <p className="text-sm text-gray-600">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google AI Studio
              </a>
              でAPIキーを取得してください
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="APIキーを入力"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleApiKeySave}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              保存
            </button>
          </div>
        )}

        {/* コントロールパネル */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* 日付選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 日付
            </label>
            <input
              type="date"
              value={formatDateForInput(date)}
              onChange={handleDateChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 時刻選択 */}
          <TimeSlider time={time} onChange={setTime} />

          {/* アニメーションコントロール */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎬 アニメーション
            </label>
            <AnimationControls time={time} onTimeChange={setTime} />
          </div>

          {/* 視点コントロール */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🧭 視点方向
            </label>
            <div className="flex items-center gap-3 mb-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={followSun}
                  onChange={(e) => setFollowSun(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                太陽に追従
              </label>
              {followSun && (
                <span className="text-xs text-blue-600">視点は太陽の方位に固定中</span>
              )}
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={viewAzimuth}
              onChange={(e) => setViewAzimuth(parseInt(e.target.value, 10))}
              disabled={followSun}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>
                向き: {formattedDirection}
              </span>
              <span>{Math.round(viewAzimuth)}°</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              キャンバスをドラッグして視点を回転できます
              {followSun && '（追従中は無効）'}
            </p>
          </div>

          {/* 位置選択 */}
          <LocationSelector
            selectedCity={selectedCity}
            customLatitude={latitude}
            customLongitude={longitude}
            onCitySelect={handleCitySelect}
            onCustomLocation={handleCustomLocation}
          />
        </div>

        {/* Canvas表示 */}
        <div className="flex justify-center">
          <SunCanvas
            date={date}
            time={time}
            latitude={latitude}
            longitude={longitude}
            width={800}
            height={500}
            viewAzimuth={viewAzimuth}
            onViewAzimuthChange={setViewAzimuth}
            followSun={followSun}
          />
        </div>

        {/* 太陽情報 */}
        <SunInfo sunData={sunData} polarCondition={polarCondition} />

        {/* AI生成セクション */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            🤖 AI生成コンテンツ
          </h2>

          <GenerateButton onClick={handleGenerate} loading={loading} />

          <AIContentSection content={content} error={error} />
        </div>

        {/* フッター */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>
            計算ライブラリ: SunCalc.js | AI: Google Gemini |
            データは参考値です
          </p>
        </div>
      </div>
    </main>
  );
}
