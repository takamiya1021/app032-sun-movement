'use client';

import { useState, useEffect, useMemo } from 'react';
import { calculateSunPosition, checkPolarConditions } from '@/lib/sunPosition';
import type { SunPositionData, PolarCondition } from '@/types/sun';

/**
 * 太陽位置計算カスタムフック
 *
 * @param initialDate - 初期日付（デフォルト: 今日）
 * @param initialTime - 初期時刻（デフォルト: 現在時刻）
 * @param initialLatitude - 初期緯度（デフォルト: 東京）
 * @param initialLongitude - 初期経度（デフォルト: 東京）
 * @returns 太陽位置データと更新関数
 */
export function useSunPosition(
  initialDate: Date = new Date(),
  initialTime?: number,
  initialLatitude: number = 35.6762,
  initialLongitude: number = 139.6503,
  initialTimeZone: string = 'UTC'
) {
  const [date, setDate] = useState<Date>(initialDate);
  const [time, setTime] = useState<number>(
    initialTime !== undefined ? initialTime : initialDate.getHours()
  );
  const [latitude, setLatitude] = useState<number>(initialLatitude);
  const [longitude, setLongitude] = useState<number>(initialLongitude);
  const [timeZone, setTimeZone] = useState<string>(initialTimeZone);

  // 太陽位置データを計算
  const sunData = useMemo<SunPositionData>(() => {
    return calculateSunPosition(date, time, latitude, longitude, timeZone);
  }, [date, time, latitude, longitude, timeZone]);

  // 極地方の条件をチェック
  const polarCondition = useMemo<PolarCondition>(() => {
    return checkPolarConditions(sunData.sunrise, sunData.sunset);
  }, [sunData.sunrise, sunData.sunset]);

  /**
   * 位置を設定
   */
  const setLocation = (lat: number, lon: number) => {
    setLatitude(lat);
    setLongitude(lon);
  };

  return {
    // 状態
    date,
    time,
    latitude,
    longitude,
    timeZone,
    sunData,
    polarCondition,

    // 更新関数
    setDate,
    setTime,
    setLocation,
    setLatitude,
    setLongitude,
    setTimeZone,
  };
}
