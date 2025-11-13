'use client';

import { useState } from 'react';
import { MAJOR_CITIES, findCity, getCityNames } from '@/lib/cities';
import type { City } from '@/lib/cities';

interface LocationSelectorProps {
  selectedCity?: City;
  customLatitude?: number;
  customLongitude?: number;
  onCitySelect: (city: City) => void;
  onCustomLocation: (latitude: number, longitude: number) => void;
}

/**
 * 位置情報選択コンポーネント
 */
export default function LocationSelector({
  selectedCity,
  customLatitude,
  customLongitude,
  onCitySelect,
  onCustomLocation,
}: LocationSelectorProps) {
  const [mode, setMode] = useState<'city' | 'custom'>('city');
  const [lat, setLat] = useState(customLatitude?.toString() || '');
  const [lon, setLon] = useState(customLongitude?.toString() || '');

  const cityNames = getCityNames();

  const handleCityChange = (cityName: string) => {
    const city = findCity(cityName);
    if (city) {
      onCitySelect(city);
    }
  };

  const handleCustomSubmit = () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (!isNaN(latitude) && !isNaN(longitude)) {
      if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
        onCustomLocation(latitude, longitude);
      } else {
        alert('緯度は-90〜90、経度は-180〜180の範囲で入力してください');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <button
          onClick={() => setMode('city')}
          className={`px-4 py-2 rounded-md transition ${
            mode === 'city'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          都市選択
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`px-4 py-2 rounded-md transition ${
            mode === 'custom'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          緯度経度入力
        </button>
      </div>

      {mode === 'city' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            都市を選択
          </label>
          <select
            value={selectedCity?.name || cityNames[0]}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {cityNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              緯度（-90 〜 90）
            </label>
            <input
              type="number"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="35.6762"
              step="0.0001"
              min="-90"
              max="90"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              経度（-180 〜 180）
            </label>
            <input
              type="number"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              placeholder="139.6503"
              step="0.0001"
              min="-180"
              max="180"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleCustomSubmit}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            この位置を使用
          </button>
        </div>
      )}
    </div>
  );
}
