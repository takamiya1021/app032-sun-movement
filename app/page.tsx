'use client';

import { useState } from 'react';
import SunCanvas from '@/components/SunCanvas';
import TimeSlider from '@/components/TimeSlider';
import LocationSelector from '@/components/LocationSelector';
import SunInfo from '@/components/SunInfo';
import { useSunPosition } from '@/hooks/useSunPosition';
import { MAJOR_CITIES } from '@/lib/cities';
import type { City } from '@/lib/cities';

export default function Home() {
  // デフォルトは東京
  const [selectedCity, setSelectedCity] = useState<City>(MAJOR_CITIES[0]);
  const [date, setDate] = useState<Date>(new Date());

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

  // 日付フォーマット（YYYY-MM-DD）
  const formatDateForInput = (d: Date) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
          />
        </div>

        {/* 太陽情報 */}
        <SunInfo sunData={sunData} polarCondition={polarCondition} />

        {/* フッター */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>
            計算ライブラリ: SunCalc.js |
            データは参考値です
          </p>
        </div>
      </div>
    </main>
  );
}
