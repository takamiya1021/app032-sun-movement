/**
 * 太陽位置データの型定義
 */
export interface SunPositionData {
  date: Date;           // 日付
  time: number;         // 時刻（0-24）
  latitude: number;     // 緯度
  longitude: number;    // 経度
  altitude: number;     // 太陽高度（度）
  azimuth: number;      // 方位角（度、0-360）
  sunrise: Date;        // 日の出時刻
  sunset: Date;         // 日の入り時刻
  solarNoon: Date;      // 南中時刻（太陽が最も高い時）
  dayLength: number;    // 昼の長さ（時間）
}

/**
 * 極地方の特殊条件
 */
export type PolarCondition = 'polar_day' | 'polar_night' | 'normal';

/**
 * 位置情報の型定義
 */
export interface Location {
  type: 'city' | 'custom';  // 都市選択 or カスタム入力
  cityName?: string;        // 都市名（都市選択時）
  latitude: number;         // 緯度
  longitude: number;        // 経度
}

/**
 * AI生成コンテンツの型定義
 */
export interface AIContent {
  trivia: string;           // 豆知識
  message: string;          // メッセージ
  uvAdvice: string;         // 日焼け対策
  photoTiming: string;      // 撮影タイミング
  generatedAt: Date;        // 生成日時
}

/**
 * アプリ設定の型定義
 */
export interface AppSettings {
  apiKey?: string;                  // Google AI Studio APIキー
  currentLocation: Location;        // 現在選択中の位置
  favoriteLocations: Location[];    // お気に入り位置
  history: SunHistory[];            // 閲覧履歴
}

/**
 * 閲覧履歴の型定義
 */
export interface SunHistory {
  date: string;         // 日付（ISO形式）
  time: number;         // 時刻（0-24）
  location: Location;   // 位置情報
  viewedAt: Date;       // 閲覧日時
}
