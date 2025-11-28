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
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [viewAzimuth, setViewAzimuth] = useState(180);
  const [followSun, setFollowSun] = useState(false);
  const [showSunPath, setShowSunPath] = useState(true);
  const [showAltitudeScale, setShowAltitudeScale] = useState(true);

  // 太陽位置計算フック
  const {
    date,
    time,
    latitude,
    longitude,
    timeZone,
    sunData,
    polarCondition,
    setDate: setSunDate,
    setTime,
    setLocation,
    setTimeZone,
  } = useSunPosition(
    new Date(),
    undefined,
    selectedCity.latitude,
    selectedCity.longitude,
    selectedCity.timezone
  );

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
    setTimeZone(city.timezone);

    // 南半球の場合は北（0度）、北半球の場合は南（180度）を向く
    if (city.latitude < 0) {
      setViewAzimuth(0);
    } else {
      setViewAzimuth(180);
    }
  };

  // カスタム位置ハンドラ
  const handleCustomLocation = (lat: number, lon: number) => {
    setLocation(lat, lon);

    // 経度からタイムゾーンを簡易推定
    let estimatedTimeZone = "UTC";
    const offset = Math.round(lon / 15);

    if (offset === 9) estimatedTimeZone = "Asia/Tokyo";
    else if (offset === 8) estimatedTimeZone = "Asia/Taipei";
    else if (offset === 10) estimatedTimeZone = "Australia/Sydney";
    else if (offset === 0) estimatedTimeZone = "UTC";
    else if (offset === 1) estimatedTimeZone = "Europe/London";
    else if (offset === -5) estimatedTimeZone = "America/New_York";
    // その他の地域はUTCオフセット表示ができればベストだが、ここでは簡易的にUTCまたは代表的な都市に倒す
    // 必要に応じて追加可能

    // カスタム都市として設定
    setSelectedCity({
      name: "Custom Location",
      nameEn: "Custom Location",
      latitude: lat,
      longitude: lon,
      timezone: estimatedTimeZone
    });

    setTimeZone(estimatedTimeZone);

    // 南半球の場合は北（0度）、北半球の場合は南（180度）を向く
    if (lat < 0) {
      setViewAzimuth(0);
    } else {
      setViewAzimuth(180);
    }
  };

  // 日付変更ハンドラ
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setSunDate(newDate);
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
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed p-4 md:p-8"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <div className="max-w-7xl mx-auto space-y-4">
        {/* ヘッダー */}
        <div className="text-center space-y-2 bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/50">
          <div className="flex items-center justify-between">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 drop-shadow-sm">
                ☀️ 太陽の動き表示
              </h1>
              <p className="text-sm text-gray-700 font-medium">
                世界各地の太陽の動きをビジュアル化
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-white/50 transition flex items-center gap-1 text-sm"
                title="APIキー設定"
              >
                <span>⚙️</span>
                <span className="hidden md:inline">APIキー設定</span>
              </button>
            </div>
          </div>
        </div>

        {/* APIキー入力 */}
        {showApiKeyInput && (
          <div className="bg-white rounded-lg shadow-lg p-4 space-y-3">
            <h3 className="font-bold text-gray-800 text-sm">Google AI Studio APIキー設定</h3>
            <p className="text-xs text-gray-600">
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
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleApiKeySave}
                className="flex-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                保存
              </button>
              {localStorage.getItem('sun-app-api-key') && (
                <button
                  onClick={() => {
                    localStorage.removeItem('sun-app-api-key');
                    setApiKey('');
                    alert('APIキーを削除しました');
                  }}
                  className="px-3 py-2 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
                >
                  削除
                </button>
              )}
            </div>
          </div>
        )}

        {/* Canvas表示（最上部） */}
        <div className="flex justify-center bg-white rounded-lg shadow-lg p-2">
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
            timeZone={timeZone}
            showSunPath={showSunPath}
            showAltitudeScale={showAltitudeScale}
          />
        </div>

        {/* コントロールパネル - 2カラムレイアウト */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 左列：時刻・日付・アニメーション */}
            <div className="space-y-3">
              {/* 時刻選択 */}
              <TimeSlider time={time} onChange={setTime} />

              {/* 日付選択 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  📅 日付
                </label>
                <input
                  type="date"
                  value={formatDateForInput(date)}
                  onChange={handleDateChange}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* アニメーションコントロール（時刻の下） */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  🎬 アニメーション
                </label>
                <AnimationControls time={time} onTimeChange={setTime} />
              </div>
            </div>

            {/* 右列：視点・位置 */}
            <div className="space-y-3">
              {/* 視点コントロール */}
              <div className="w-full space-y-2">
                <div className="flex justify-between items-center h-[28px]">
                  <label className="text-sm font-medium text-gray-700">
                    🧭 視点方向
                  </label>
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={followSun}
                        onChange={(e) => setFollowSun(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      太陽に追従
                    </label>
                    <label className="flex items-center gap-1.5 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={showSunPath}
                        onChange={(e) => setShowSunPath(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      軌跡を表示
                    </label>
                    <label className="flex items-center gap-1.5 text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={showAltitudeScale}
                        onChange={(e) => setShowAltitudeScale(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      高度目盛り
                    </label>
                  </div>
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
                <div className="flex justify-between text-xs text-gray-600">
                  <span>向き: {formattedDirection}</span>
                  <span>{Math.round(viewAzimuth)}°</span>
                </div>
              </div>

              {/* 位置選択（視点の下） */}
              <LocationSelector
                selectedCity={selectedCity}
                customLatitude={latitude}
                customLongitude={longitude}
                onCitySelect={handleCitySelect}
                onCustomLocation={handleCustomLocation}
              />
            </div>
          </div>
        </div>

        {/* 太陽情報（最下部） */}
        <SunInfo
          sunData={sunData}
          polarCondition={polarCondition}
          timeZone={timeZone}
          cityName={selectedCity.name}
        />

        {/* AI生成セクション */}
        <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 text-center">
            🤖 AI生成コンテンツ
          </h2>

          <GenerateButton onClick={handleGenerate} loading={loading} />

          <AIContentSection content={content} error={error} />
        </div>

        {/* フッター */}
        <div className="text-center text-sm text-gray-600 py-4 bg-white/50 backdrop-blur-sm rounded-lg mx-auto max-w-2xl">
          <p>
            計算ライブラリ: SunCalc.js | AI: Google Gemini |
            データは参考値です
          </p>
        </div>
      </div>
    </main>
  );
}
