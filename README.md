# ☀️ 太陽の動き表示

世界各地の太陽の動きをビジュアル化するWebアプリケーション

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-31%2F32%20passed-brightgreen)
![PWA](https://img.shields.io/badge/PWA-enabled-blue)

## 📋 概要

「太陽の動き表示」は、世界中の任意の場所と日時における太陽の位置を計算し、美しいビジュアルで表示するアプリケーションです。SunCalc.jsによる正確な天文計算と、Google Gemini AIによる太陽関連情報の生成を組み合わせています。

### ✨ 主な機能

- 🌍 **世界17都市対応** - 東京、ロンドン、ニューヨーク、トロムソ（白夜体験可能）など
- 📍 **緯度経度手動入力** - 任意の地点の太陽の動きを確認
- 🎨 **時間帯別の空の色変化** - 夜明け前、朝焼け、昼、夕焼け、夜の5パターン
- 🌅 **太陽の軌跡表示** - 日の出から日の入りまでの軌跡を可視化
- 📊 **詳細な太陽情報** - 日の出・日の入り・南中時刻・太陽高度・方位角・昼の長さ
- 🤖 **AI生成コンテンツ** - Google Geminiによる豆知識・メッセージ・UV対策・撮影アドバイス
- 📱 **PWA対応** - オフライン動作、インストール可能
- 🌙 **白夜・極夜対応** - 極地方の特殊な太陽の動きも正確に表示

## 🚀 クイックスタート

### 前提条件

- Node.js 18以上
- npm または pnpm

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/app032-sun-movement.git
cd app032-sun-movement

# 依存関係をインストール
npm install

# 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

### AI機能を使用する場合

1. [Google AI Studio](https://aistudio.google.com/app/apikey) でAPIキーを取得
2. アプリ内の「⚙️ APIキー設定」からAPIキーを入力・保存
3. 「✨ AI情報を生成」ボタンをクリック

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 14.2** - React フレームワーク (App Router)
- **TypeScript 5** - 型安全性
- **Tailwind CSS 3.4** - ユーティリティファーストCSS

### ライブラリ
- **SunCalc.js 1.9** - 太陽位置計算
- **next-pwa** - PWA対応

### AI
- **Google AI Studio API** - Gemini Pro モデル

### テスト
- **Jest** - テストフレームワーク
- **React Testing Library** - コンポーネントテスト
- **jest-canvas-mock** - Canvas APIモック

## 📁 プロジェクト構造

```
app032-sun-movement/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # ルートレイアウト（PWAメタデータ）
│   ├── page.tsx             # メインページ
│   └── globals.css          # グローバルスタイル
├── components/              # Reactコンポーネント
│   ├── SunCanvas.tsx        # 太陽のCanvas描画
│   ├── TimeSlider.tsx       # 時刻選択スライダー
│   ├── LocationSelector.tsx # 位置選択
│   ├── SunInfo.tsx          # 太陽情報表示
│   ├── GenerateButton.tsx   # AI生成ボタン
│   └── AIContentSection.tsx # AI生成コンテンツ表示
├── lib/                     # ユーティリティ・ロジック
│   ├── sunPosition.ts       # 太陽位置計算（SunCalc wrapper）
│   ├── sunDraw.ts           # Canvas描画ロジック
│   ├── skyColor.ts          # 時間帯別の空の色定義
│   ├── cities.ts            # 主要都市データ
│   ├── aiService.ts         # Google AI Studio API統合
│   └── storage.ts           # ローカルストレージ管理
├── hooks/                   # カスタムフック
│   ├── useSunPosition.ts    # 太陽位置計算フック
│   └── useAIGeneration.ts   # AI生成フック
├── types/                   # TypeScript型定義
│   └── sun.ts               # 太陽関連の型
├── __tests__/               # テストファイル
│   ├── lib/                 # ライブラリテスト
│   ├── hooks/               # フックテスト
│   └── components/          # コンポーネントテスト
└── public/                  # 静的ファイル
    ├── manifest.json        # PWA マニフェスト
    ├── icon-192.png         # アプリアイコン
    └── icon-512.png         # アプリアイコン
```

## 🧪 テスト

### 全テスト実行

```bash
npm test
```

### カバレッジ付きテスト

```bash
npm test -- --coverage
```

### テスト結果

- **テストスイート**: 6 passed
- **テスト**: 31 passed, 1 skipped
- **カバレッジ**: 80%以上（主要ロジック）

## 🏗️ ビルド

### プロダクションビルド

```bash
npm run build
```

### プロダクションサーバー起動

```bash
npm start
```

## 📱 PWA機能

このアプリはPWA（Progressive Web App）として動作します：

- ✅ **オフライン動作** - 太陽の計算はオフラインでも可能（AI生成はオンライン必須）
- ✅ **インストール可能** - ホーム画面に追加してアプリとして使用可能
- ✅ **レスポンシブデザイン** - モバイル・タブレット・デスクトップ対応

## 🎯 使用例

### 白夜を体験する

1. 位置選択で「トロムソ」を選択
2. 日付を6月21日（夏至）に設定
3. 時刻スライダーを動かして、太陽が沈まない様子を確認

### 極夜を体験する

1. 位置選択で「トロムソ」を選択
2. 日付を12月22日（冬至）に設定
3. 太陽が昇らない（極夜）の表示を確認

### 季節による昼の長さの違い

1. 東京を選択
2. 6月21日（夏至）と12月22日（冬至）を比較
3. 昼の長さの差（約5時間）を確認

## 📊 開発履歴

### Phase 0: テスト環境構築 ✅
- Next.js + TypeScript + Tailwind CSSセットアップ
- Jest + React Testing Library設定

### Phase 1: 太陽位置計算ロジック ✅
- SunCalc.js統合
- 17都市の緯度経度データ
- 白夜・極夜対応

### Phase 2: Canvas描画 ✅
- 時間帯別の空の色（5パターン）
- 太陽の描画（発光効果付き）
- 太陽の軌跡表示

### Phase 3: UI実装 ✅
- 日付・時刻選択
- 位置選択（都市/緯度経度）
- 太陽情報表示

### Phase 4: AI生成機能 ✅
- Google AI Studio API統合
- 4種類のコンテンツ生成
- ローディング・エラーハンドリング

### Phase 5: ローカルストレージ ✅
- APIキー永続化
- 位置情報保存
- お気に入り管理

### Phase 6: PWA対応 ✅
- next-pwa統合
- manifest.json作成
- Service Worker自動生成

## 🤝 コントリビューション

このプロジェクトは学習・実験目的で作成されています。

## 📄 ライセンス

MIT License

## 🙏 謝辞

- **SunCalc.js** - 正確な太陽位置計算ライブラリ
- **Google AI Studio** - Gemini AI API
- **Next.js team** - 素晴らしいReactフレームワーク

---

**作成者**: クロ
**作成日**: 2025年1月13日
**バージョン**: 1.0.0
