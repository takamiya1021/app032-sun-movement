import SunCalc from 'suncalc';
import type { SunPositionData, PolarCondition } from '@/types/sun';

/**
 * 太陽位置を計算する
 *
 * @param date - 日付
 * @param time - 時刻（0-24）
 * @param latitude - 緯度
 * @param longitude - 経度
 * @returns 太陽位置データ
 */
export function calculateSunPosition(
  date: Date,
  time: number,
  latitude: number,
  longitude: number
): SunPositionData {
  // 指定時刻のDateオブジェクトを作成（ローカルタイムで）
  const dateTime = new Date(date);
  dateTime.setHours(Math.floor(time), (time % 1) * 60, 0, 0);

  // SunCalc.jsで太陽位置を計算
  const position = SunCalc.getPosition(dateTime, latitude, longitude);
  // 日の出・日の入りは指定された日付で計算
  const timesDate = new Date(date);
  timesDate.setHours(12, 0, 0, 0); // 正午を基準にして日の出・日の入りを計算
  const times = SunCalc.getTimes(timesDate, latitude, longitude);

  // ラジアンから度に変換
  const altitude = position.altitude * (180 / Math.PI);
  // 方位角を0-360度に変換（SunCalcは-180〜180、南が0）
  const azimuth = (position.azimuth * (180 / Math.PI) + 180) % 360;

  // 昼の長さを計算（時間単位）
  let dayLength = 0;
  if (!isNaN(times.sunrise.getTime()) && !isNaN(times.sunset.getTime())) {
    dayLength = (times.sunset.getTime() - times.sunrise.getTime()) / (1000 * 60 * 60);
  }

  return {
    date,
    time,
    latitude,
    longitude,
    altitude,
    azimuth,
    sunrise: times.sunrise,
    sunset: times.sunset,
    solarNoon: times.solarNoon,
    dayLength,
  };
}

/**
 * 極地方の特殊条件をチェックする
 *
 * @param sunrise - 日の出時刻
 * @param sunset - 日の入り時刻
 * @returns 極地方の条件（白夜・極夜・通常）
 */
export function checkPolarConditions(
  sunrise: Date,
  sunset: Date
): PolarCondition {
  const sunriseValid = !isNaN(sunrise.getTime());
  const sunsetValid = !isNaN(sunset.getTime());

  // 日の出が有効で日の入りが無効 → 白夜（太陽が沈まない）
  if (sunriseValid && !sunsetValid) {
    return 'polar_day';
  }

  // 日の出が無効 → 極夜（太陽が昇らない）
  if (!sunriseValid) {
    return 'polar_night';
  }

  // それ以外は通常
  return 'normal';
}

/**
 * 緯度経度のバリデーション
 *
 * @param lat - 緯度
 * @param lon - 経度
 * @returns バリデーション結果
 */
export function validateCoordinates(
  lat: number,
  lon: number
): { valid: boolean; error?: string } {
  if (lat < -90 || lat > 90) {
    return { valid: false, error: '緯度は-90〜90の範囲で入力してください' };
  }
  if (lon < -180 || lon > 180) {
    return { valid: false, error: '経度は-180〜180の範囲で入力してください' };
  }
  return { valid: true };
}
