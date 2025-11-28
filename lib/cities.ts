/**
 * 都市情報の型定義
 */
export interface City {
  name: string;        // 日本語名
  nameEn: string;      // 英語名
  latitude: number;    // 緯度
  longitude: number;   // 経度
  timezone: string;    // タイムゾーン
}

/**
 * 主要都市の緯度経度データ
 * 極地方も含めて白夜・極夜を体験できるようにする
 */
export const MAJOR_CITIES: City[] = [
  { name: '東京', nameEn: 'Tokyo', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'ロンドン', nameEn: 'London', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'ニューヨーク', nameEn: 'New York', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { name: '嘉義 (北回帰線)', nameEn: 'Chiayi (Tropic of Cancer)', latitude: 23.4583, longitude: 120.4167, timezone: 'Asia/Taipei' },
  { name: 'アリススプリングス (南回帰線)', nameEn: 'Alice Springs (Tropic of Capricorn)', latitude: -23.6980, longitude: 133.8807, timezone: 'Australia/Darwin' },
  { name: 'シドニー', nameEn: 'Sydney', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { name: '北京', nameEn: 'Beijing', latitude: 39.9042, longitude: 116.4074, timezone: 'Asia/Shanghai' },
  { name: 'シンガポール', nameEn: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'パリ', nameEn: 'Paris', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
  { name: 'ベルリン', nameEn: 'Berlin', latitude: 52.5200, longitude: 13.4050, timezone: 'Europe/Berlin' },
  { name: 'モスクワ', nameEn: 'Moscow', latitude: 55.7558, longitude: 37.6173, timezone: 'Europe/Moscow' },
  { name: 'カイロ', nameEn: 'Cairo', latitude: 30.0444, longitude: 31.2357, timezone: 'Africa/Cairo' },
  { name: 'ドバイ', nameEn: 'Dubai', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'サンフランシスコ', nameEn: 'San Francisco', latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles' },
  { name: 'ロサンゼルス', nameEn: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'リオデジャネイロ', nameEn: 'Rio de Janeiro', latitude: -22.9068, longitude: -43.1729, timezone: 'America/Sao_Paulo' },
  { name: 'ソウル', nameEn: 'Seoul', latitude: 37.5665, longitude: 126.9780, timezone: 'Asia/Seoul' },
  // 極地方（白夜・極夜体験用）
  { name: 'レイキャビク', nameEn: 'Reykjavik', latitude: 64.1466, longitude: -21.9426, timezone: 'Atlantic/Reykjavik' },
  { name: 'トロムソ', nameEn: 'Tromsø', latitude: 69.6492, longitude: 18.9553, timezone: 'Europe/Oslo' },
];

/**
 * 都市名（日本語または英語）で都市情報を検索
 */
export function findCity(name: string): City | undefined {
  return MAJOR_CITIES.find(
    city => city.name === name || city.nameEn === name
  );
}

/**
 * 都市リストの名前のみを取得
 */
export function getCityNames(): string[] {
  return MAJOR_CITIES.map(city => city.name);
}
