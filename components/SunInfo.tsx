'use client';

import type { SunPositionData, PolarCondition } from '@/types/sun';
import { formatTimeInTimeZone } from '@/lib/timezone';

interface SunInfoProps {
  sunData: SunPositionData;
  polarCondition: PolarCondition;
  timeZone: string;
  cityName?: string;
}

/**
 * 太陽情報表示コンポーネント
 */
export default function SunInfo({ sunData, polarCondition, timeZone, cityName }: SunInfoProps) {
  const formatTime = (date: Date) => {
    if (isNaN(date.getTime())) {
      return '--:--';
    }
    return formatTimeInTimeZone(date, timeZone);
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    return `${h}時間${m}分`;
  };

  // 極地方の特殊表示
  if (polarCondition === 'polar_day') {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-bold text-yellow-800 flex items-center">
          ☀️ 白夜（太陽が沈まない）
        </h3>
        <p className="text-sm text-yellow-700">
          この日、この場所では太陽が地平線下に沈みません。
        </p>
      </div>
    );
  }

  if (polarCondition === 'polar_night') {
    return (
      <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-bold text-indigo-800 flex items-center">
          🌙 極夜（太陽が昇らない）
        </h3>
        <p className="text-sm text-indigo-700">
          この日、この場所では太陽が地平線上に昇りません。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h3 className="text-lg font-bold text-gray-800 border-b pb-2 flex flex-col">
        <span>☀️ 太陽情報</span>
        {cityName && (
          <span className="text-xs text-gray-500 font-normal">{cityName} 現地時間</span>
        )}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-xs text-gray-500">日の出</div>
          <div className="text-lg font-semibold text-orange-600">
            🌅 {formatTime(sunData.sunrise)}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-500">日の入り</div>
          <div className="text-lg font-semibold text-orange-600">
            🌇 {formatTime(sunData.sunset)}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-500">南中時刻</div>
          <div className="text-lg font-semibold text-blue-600">
            ☀️ {formatTime(sunData.solarNoon)}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-500">昼の長さ</div>
          <div className="text-lg font-semibold text-blue-600">
            ⏰ {formatDuration(sunData.dayLength)}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-500">太陽高度</div>
          <div className="text-lg font-semibold text-green-600">
            📐 {sunData.altitude.toFixed(1)}°
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-500">方位角</div>
          <div className="text-lg font-semibold text-green-600">
            🧭 {sunData.azimuth.toFixed(1)}°
          </div>
        </div>
      </div>
    </div>
  );
}
