# 🛠️ 技術設計書：No.32「太陽の動き表示」

**作成日**: 2025-01-13
**バージョン**: 1.0
**アプリ番号**: 32

---

## 1. 技術スタック

### 1.1 推奨構成（31番と共通）
- **フレームワーク**: Next.js 14.x（App Router）
- **言語**: TypeScript 5.x
- **UI**: React 18.x
- **スタイリング**: Tailwind CSS v3
- **PWA**: next-pwa
- **AI API**: Google AI Studio (Gemini API)
- **天文計算**: SunCalc.js
- **状態管理**: React Context API
- **ローカルストレージ**: Web Storage API

### 1.2 開発ツール
- **リンター**: ESLint 8.x
- **フォーマッター**: Prettier
- **パッケージマネージャー**: npm または pnpm

---

## 2. アーキテクチャ設計

### 2.1 コンポーネント構成

```
app/
├── layout.tsx                  // ルートレイアウト（PWA設定含む）
├── page.tsx                    // メインページ
├── components/
│   ├── SunCanvas.tsx           // 太陽のCanvas描画コンポーネント
│   ├── DateSelector.tsx        // カレンダー選択（31番と共通）
│   ├── TimeSlider.tsx          // 時間選択スライダー
│   ├── LocationSelector.tsx    // 位置情報選択
│   ├── SunInfo.tsx             // 日の出・日の入り等の情報表示
│   ├── AIContentSection.tsx    // AI生成コンテンツ表示（31番と共通）
│   ├── GenerateButton.tsx      // AI生成ボタン（31番と共通）
│   └── Navigation.tsx          // 共通ナビゲーション
├── lib/
│   ├── sunPosition.ts          // 太陽位置計算ロジック（SunCalc.js wrapper）
│   ├── sunDraw.ts              // Canvas描画ロジック
│   ├── skyColor.ts             // 時間帯別の空の色定義
│   ├── aiService.ts            // Google AI Studio API統合（31番と共通化）
│   ├── storage.ts              // ローカルストレージ管理（31番と共通化）
│   └── cities.ts               // 主要都市の緯度経度データ
├── hooks/
│   ├── useSunPosition.ts       // 太陽位置計算カスタムフック
│   └── useAIGeneration.ts      // AI生成カスタムフック（31番と共通）
└── types/
    └── sun.ts                  // 型定義
```

### 2.2 データフロー

```
[DateSelector] + [TimeSlider] + [LocationSelector]
    ↓ 日付・時刻・位置変更
[useSunPosition] → 太陽位置計算 → [SunCanvas] → Canvas描画
    ↓                                ↓
[SunInfo]                        [空の色 + 太陽軌跡]

[GenerateButton]
    ↓ クリック
[useAIGeneration] → Google AI API → [AIContentSection]
```

---

## 3. Canvas描画設計

### 3.1 SunCanvas仕様

#### 3.1.1 基本設定
```typescript
interface SunCanvasConfig {
  size: number;              // Canvasサイズ
  sunRadius: number;         // 太陽の半径（画面の15%〜20%）
  skyColors: SkyColorScheme; // 時間帯別の空の色
  sunColor: string;          // 太陽の基本色（暖色系）
}

interface SkyColorScheme {
  beforeDawn: string[];      // 夜明け前のグラデーション
  sunrise: string[];         // 朝焼け
  daytime: string[];         // 昼
  sunset: string[];          // 夕焼け
  night: string[];           // 夜
}
```

#### 3.1.2 描画ロジック

**1. 空の背景描画**
```typescript
function drawSky(
  ctx: CanvasRenderingContext2D,
  time: number,  // 0-24時間
  sunAltitude: number  // 太陽高度
) {
  // 時間帯判定
  const skyPhase = getSkyPhase(time, sunAltitude);
  const colors = getSkyColors(skyPhase);

  // 縦方向グラデーション
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
```

**2. 太陽の軌跡描画**
```typescript
function drawSunPath(
  ctx: CanvasRenderingContext2D,
  sunrisePos: Position,
  sunsetPos: Position,
  currentPos: Position
) {
  // 日の出→南中→日の入りの弧を描画
  ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);

  // ベジェ曲線で軌跡表現
  ctx.beginPath();
  ctx.moveTo(sunrisePos.x, sunrisePos.y);
  // ... 弧の描画
  ctx.stroke();

  // 日の出・日の入りマーカー
  drawMarker(ctx, sunrisePos, '日の出');
  drawMarker(ctx, sunsetPos, '日の入り');
}
```

**3. 太陽の描画**
```typescript
function drawSun(
  ctx: CanvasRenderingContext2D,
  position: Position,
  altitude: number
) {
  const radius = getSunRadius(altitude); // 高度で大きさ変化

  // 発光効果（グラデーション）
  const gradient = ctx.createRadialGradient(
    position.x, position.y, 0,
    position.x, position.y, radius * 2
  );
  gradient.addColorStop(0, '#FFF5E1');      // 中心: クリーム
  gradient.addColorStop(0.5, '#FFD700');    // ミドル: ゴールド
  gradient.addColorStop(1, 'rgba(255,215,0,0)'); // 外側: 透明

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius * 2, 0, Math.PI * 2);
  ctx.fill();

  // 太陽本体
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
  ctx.fill();
}
```

#### 3.1.3 時間帯別の空の色定義

```typescript
// lib/skyColor.ts
export const SKY_COLORS = {
  beforeDawn: ['#0a0e27', '#1a1f3a', '#2a3a5a'], // 深い青〜紫
  sunrise: ['#FF6B35', '#F7931E', '#FDC830'],    // オレンジ〜黄
  daytime: ['#87CEEB', '#5BA3D0', '#4A90E2'],    // 明るい青
  sunset: ['#FF6B35', '#FF4E50', '#FC913A'],     // オレンジ〜赤
  night: ['#0a0a1a', '#1a1a2e', '#16213e']       // 濃紺〜黒
};

export function getSkyPhase(hour: number, altitude: number): SkyPhase {
  if (altitude < -6) return 'night';           // 太陽が地平線下6度以下
  if (altitude < 0 && hour < 12) return 'beforeDawn';
  if (altitude < 6 && hour < 12) return 'sunrise';
  if (altitude < 6 && hour >= 12) return 'sunset';
  if (altitude >= 6) return 'daytime';
  return 'night';
}
```

#### 3.1.4 アニメーション
- 時間スライダー変更時：太陽位置をスムーズに遷移（0.3秒）
- 空の色：グラデーション遷移（0.5秒）
- requestAnimationFrame使用

---

## 4. 太陽位置計算

### 4.1 SunCalc.js統合

```typescript
// lib/sunPosition.ts
import SunCalc from 'suncalc';

export interface SunPositionData {
  date: Date;
  time: number;              // 0-24
  latitude: number;
  longitude: number;
  altitude: number;          // 太陽高度（度）
  azimuth: number;           // 方位角（度）
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;           // 南中時刻
  dayLength: number;         // 昼の長さ（時間）
}

export function calculateSunPosition(
  date: Date,
  time: number,
  latitude: number,
  longitude: number
): SunPositionData {
  // 指定時刻のDateオブジェクト作成
  const dateTime = new Date(date);
  dateTime.setHours(time, 0, 0, 0);

  // SunCalc.jsで計算
  const position = SunCalc.getPosition(dateTime, latitude, longitude);
  const times = SunCalc.getTimes(date, latitude, longitude);

  // ラジアン→度変換
  const altitude = position.altitude * (180 / Math.PI);
  const azimuth = position.azimuth * (180 / Math.PI) + 180; // 0-360度

  // 昼の長さ計算
  const dayLength =
    (times.sunset.getTime() - times.sunrise.getTime()) / (1000 * 60 * 60);

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
    dayLength
  };
}
```

### 4.2 白夜・極夜の対応

```typescript
export function checkPolarConditions(
  sunrise: Date,
  sunset: Date
): 'polar_day' | 'polar_night' | 'normal' {
  // SunCalc.jsで日の出・日の入りがInvalid Dateの場合
  if (isNaN(sunrise.getTime())) {
    // 夏季: 白夜（太陽が沈まない）
    return 'polar_day';
  }
  if (isNaN(sunset.getTime())) {
    // 冬季: 極夜（太陽が昇らない）
    return 'polar_night';
  }
  return 'normal';
}
```

---

## 5. 位置情報管理

### 5.1 主要都市データ

```typescript
// lib/cities.ts
export interface City {
  name: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const MAJOR_CITIES: City[] = [
  { name: '東京', nameEn: 'Tokyo', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'ロンドン', nameEn: 'London', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'ニューヨーク', nameEn: 'New York', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
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
```

### 5.2 緯度経度バリデーション

```typescript
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
```

---

## 6. Google AI Studio API統合

### 6.1 プロンプト設計

#### 6.1.1 豆知識・神話生成
```
あなたは天文学と神話に詳しい専門家です。
${date}の太陽（高度${altitude}度、${cityName}）について、
興味深い豆知識を1つ、150文字程度で教えてください。
太陽にまつわる神話・文化・科学的知識から選んでください。
```

#### 6.1.2 メッセージ生成
```
あなたは太陽と自然に詳しいアドバイザーです。
${date}、${cityName}での太陽（${phaseName}）について、
前向きで心地よいメッセージを100文字程度で伝えてください。
```

#### 6.1.3 日焼け対策アドバイス
```
あなたは皮膚科医です。
${date}、時刻${time}時の太陽高度${altitude}度での
紫外線対策アドバイスを100文字程度で教えてください。
季節・時間帯を考慮してください。
```

#### 6.1.4 写真撮影タイミング
```
あなたはプロカメラマンです。
${date}、${cityName}での撮影について、
- 日の出時刻: ${sunrise}
- 日の入り時刻: ${sunset}
を踏まえ、ゴールデンアワー・マジックアワーの
ベストタイミングを100文字程度で提案してください。
```

---

## 7. PWA設定（31番と共通）

### 7.1 manifest.json
```json
{
  "name": "太陽の動き表示",
  "short_name": "太陽ビューア",
  "description": "世界各地の太陽の動きを確認できるアプリ",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#87CEEB",
  "theme_color": "#4A90E2",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 8. データモデル設計

### 8.1 型定義

```typescript
// types/sun.ts

export interface SunPositionData {
  date: Date;
  time: number;              // 0-24
  latitude: number;
  longitude: number;
  altitude: number;          // 太陽高度（度）
  azimuth: number;           // 方位角（度）
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  dayLength: number;         // 昼の長さ（時間）
}

export interface AIContent {
  trivia: string;            // 豆知識
  message: string;           // メッセージ
  uvAdvice: string;          // 日焼け対策
  photoTiming: string;       // 撮影タイミング
  generatedAt: Date;
}

export interface Location {
  type: 'city' | 'custom';
  cityName?: string;
  latitude: number;
  longitude: number;
}

export interface AppSettings {
  apiKey?: string;
  currentLocation: Location;
  favoriteLocations: Location[];
  history: SunHistory[];
}

export interface SunHistory {
  date: string;
  time: number;
  location: Location;
  viewedAt: Date;
}
```

### 8.2 ローカルストレージ構造

```typescript
const STORAGE_KEYS = {
  API_KEY: 'sun-app-api-key',
  LOCATION: 'sun-app-location',
  FAVORITES: 'sun-app-favorites',
  HISTORY: 'sun-app-history',
};
```

---

## 9. 31番アプリとの共通化

### 9.1 共通モジュール
- `lib/aiService.ts`：AI API統合（共通化）
- `lib/storage.ts`：ローカルストレージ管理（共通化）
- `components/Navigation.tsx`：共通ナビゲーション
- `components/AIContentSection.tsx`：AI表示セクション
- `components/GenerateButton.tsx`：生成ボタン

### 9.2 差分モジュール（32番固有）
- `lib/sunPosition.ts`：太陽位置計算
- `lib/sunDraw.ts`：太陽描画ロジック
- `lib/skyColor.ts`：空の色定義
- `lib/cities.ts`：都市データ
- `components/SunCanvas.tsx`：太陽Canvas
- `components/TimeSlider.tsx`：時間選択
- `components/LocationSelector.tsx`：位置選択

---

## 10. パフォーマンス最適化

### 10.1 Canvas最適化
- デバイスピクセル比対応（Retina対応）
- requestAnimationFrame使用
- 描画範囲の最小化

### 10.2 計算最適化
- SunCalc.jsの計算結果をキャッシュ（同じ日付・時刻・位置）
- 軌跡の座標を事前計算

---

## 11. テスト戦略（31番と同様）

### 11.1 単体テスト
- 太陽位置計算ロジック
- Canvas描画関数
- 空の色判定ロジック
- 都市データ検索

### 11.2 統合テスト
- コンポーネント連携
- ローカルストレージ操作

### 11.3 E2Eテスト
- 都市選択 → 日付・時刻選択 → 太陽表示の流れ
- AI生成フロー

---

## 12. 次ステップ

1. ✅ 技術設計書レビュー・承認
2. ⬜ 実装計画書作成（TDD準拠版）
3. ⬜ 開発環境セットアップ
4. ⬜ 実装開始（Claude Code on the Web）

---

**作成者**: クロ
**レビュー待ち**: あおいさん
