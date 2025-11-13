# 📝 実装計画書（TDD準拠版）：No.32「太陽の動き表示」

**作成日**: 2025-01-13
**バージョン**: 1.0
**アプリ番号**: 32

---

## 実装方針

### TDD（Test-Driven Development）原則
- 全Phaseで **Red-Green-Refactor** サイクルを適用
- テストファースト：実装前にテストを書く
- 完了条件：全テストパス、コードカバレッジ80%以上

### 開発環境
- Next.js 14.x + TypeScript 5.x
- テストフレームワーク: Jest + React Testing Library
- E2Eテスト: Playwright（オプション）

### 31番との関係
- 31番の構造をベースに実装
- 共通モジュールは流用・共通化
- 差分モジュールを追加実装

---

## Phase 0: テスト環境構築（予定工数: 2時間）

### タスク

- [ ] **0-1. Next.jsプロジェクトセットアップ（Red）**
  - `npx create-next-app@latest app032-sun-movement --typescript --tailwind --app`
  - プロジェクト構造確認
  - **完了条件**: `npm run dev`で起動確認

- [ ] **0-2. Jest + React Testing Library設定（Green）**
  - `npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom`
  - `jest.config.js`作成
  - `setupTests.ts`作成
  - **完了条件**: `npm test`でテスト実行可能

- [ ] **0-3. Canvas Mock + SunCalc設定（Green）**
  - `npm install --save-dev jest-canvas-mock`
  - `npm install suncalc @types/suncalc`
  - Canvas API用のモック設定
  - **完了条件**: Canvas・SunCalc関連テストが実行可能

- [ ] **0-4. サンプルテスト作成・実行（Refactor）**
  - `__tests__/sample.test.ts`作成
  - テスト実行確認
  - **完了条件**: テストがパスすることを確認

---

## Phase 1: 太陽位置計算ロジック実装（予定工数: 4時間）

### タスク

- [ ] **1-1. 都市データ作成（Green）**
  - `lib/cities.ts`作成
  - 主要都市15〜20都市の緯度経度データ
  - **完了条件**: 都市データが正確

- [ ] **1-2. 太陽位置計算テスト作成（Red）**
  - `__tests__/lib/sunPosition.test.ts`作成
  - 既知の日付・位置での太陽位置計算テストケース
  - 白夜・極夜の特殊ケーステスト
  - **完了条件**: テストが失敗することを確認

- [ ] **1-3. 太陽位置計算ロジック実装（Green）**
  - `lib/sunPosition.ts`作成
  - SunCalc.js wrapper実装
  - `calculateSunPosition()`関数実装
  - `checkPolarConditions()`関数実装
  - **完了条件**: 全テストがパス

- [ ] **1-4. 型定義整備（Refactor）**
  - `types/sun.ts`作成
  - `SunPositionData`等のインターフェース定義
  - 関数の戻り値を型安全に
  - **完了条件**: TypeScriptエラーゼロ、テストパス

- [ ] **1-5. カスタムフック作成（Red → Green → Refactor）**
  - `__tests__/hooks/useSunPosition.test.ts`作成（Red）
  - `hooks/useSunPosition.ts`実装（Green）
  - React Hooksのルール準拠確認（Refactor）
  - **完了条件**: 全テストパス、Hooks動作確認

---

## Phase 2: Canvas描画実装（予定工数: 6時間）

### タスク

- [ ] **2-1. 空の色定義実装（Green）**
  - `lib/skyColor.ts`作成
  - 時間帯別の色配列定義
  - `getSkyPhase()`関数実装
  - **完了条件**: 各時間帯の色が定義済み

- [ ] **2-2. Canvas描画ユーティリティテスト作成（Red）**
  - `__tests__/lib/sunDraw.test.ts`作成
  - `drawSky()`関数のテストケース
  - `drawSun()`関数のテストケース
  - `drawSunPath()`関数のテストケース
  - **完了条件**: テストが失敗することを確認

- [ ] **2-3. Canvas描画ロジック実装（Green）**
  - `lib/sunDraw.ts`作成
  - `drawSky()`関数実装（時間帯別グラデーション）
  - `drawSun()`関数実装（発光効果付き）
  - `drawSunPath()`関数実装（軌跡の弧）
  - `drawMarker()`関数実装（日の出・日の入りマーク）
  - **完了条件**: 全テストがパス

- [ ] **2-4. SunCanvasコンポーネントテスト作成（Red）**
  - `__tests__/components/SunCanvas.test.tsx`作成
  - コンポーネント描画テスト
  - プロパティ変更時の再描画テスト
  - **完了条件**: テストが失敗することを確認

- [ ] **2-5. SunCanvasコンポーネント実装（Green）**
  - `components/SunCanvas.tsx`作成
  - `useEffect`でCanvas初期化
  - `useSunPosition`統合
  - 時間・位置変更時の再描画
  - **完了条件**: 全テストがパス、実際の描画確認

- [ ] **2-6. アニメーション実装（Refactor）**
  - `requestAnimationFrame`でスムーズ遷移
  - 空の色のグラデーション遷移
  - パフォーマンス最適化
  - **完了条件**: 60fps維持、テストパス

---

## Phase 3: UI実装（予定工数: 5時間）

### タスク

- [ ] **3-1. DateSelectorコンポーネント（31番から流用）**
  - 31番の`DateSelector.tsx`をコピー
  - 必要に応じて調整
  - **完了条件**: 日付選択動作確認

- [ ] **3-2. TimeSliderテスト作成（Red）**
  - `__tests__/components/TimeSlider.test.tsx`作成
  - スライダー操作テスト
  - 時刻表示テスト
  - **完了条件**: テストが失敗することを確認

- [ ] **3-3. TimeSliderコンポーネント実装（Green）**
  - `components/TimeSlider.tsx`作成
  - 0〜24時のスライダー
  - 1時間刻み（オプション：15分刻み）
  - リアルタイム時刻への「今」ボタン
  - **完了条件**: 全テストがパス

- [ ] **3-4. LocationSelectorテスト作成（Red）**
  - `__tests__/components/LocationSelector.test.tsx`作成
  - 都市選択テスト
  - 緯度経度手動入力テスト
  - バリデーションテスト
  - **完了条件**: テストが失敗することを確認

- [ ] **3-5. LocationSelectorコンポーネント実装（Green）**
  - `components/LocationSelector.tsx`作成
  - 都市ドロップダウン
  - 緯度経度入力フォーム
  - バリデーション機能
  - **完了条件**: 全テストがパス

- [ ] **3-6. SunInfoコンポーネント実装（Red → Green → Refactor）**
  - `__tests__/components/SunInfo.test.tsx`作成（Red）
  - `components/SunInfo.tsx`実装（Green）
  - 日の出・日の入り・南中時刻・昼の長さ表示（Green）
  - 白夜・極夜の特殊表示（Refactor）
  - **完了条件**: 全テストパス、表示確認

- [ ] **3-7. メインページ統合（Refactor）**
  - `app/page.tsx`に各コンポーネント統合
  - レイアウト調整
  - レスポンシブ対応確認
  - **完了条件**: 全コンポーネント連携動作、テストパス

---

## Phase 4: AI生成機能実装（予定工数: 4時間）

### タスク

- [ ] **4-1. AIサービス共通化（31番から流用）**
  - 31番の`lib/aiService.ts`を共通ライブラリとして配置
  - 両アプリで参照できるよう調整
  - **完了条件**: 31番・32番両方で使用可能

- [ ] **4-2. 太陽用プロンプト実装（Red → Green）**
  - `__tests__/lib/aiService.test.ts`に32番用テスト追加（Red）
  - 豆知識・メッセージ・日焼け対策・撮影タイミングのプロンプト実装（Green）
  - **完了条件**: 全テストがパス

- [ ] **4-3. useAIGenerationフック調整（Refactor）**
  - 31番の`useAIGeneration.ts`を流用
  - 32番用のコンテンツ種別に対応
  - **完了条件**: 全テストパス、Hooks動作確認

- [ ] **4-4. AIContentSectionコンポーネント（31番から流用・調整）**
  - 31番の`AIContentSection.tsx`を流用
  - 32番用の4項目表示に調整（豆知識・メッセージ・日焼け対策・撮影タイミング）
  - **完了条件**: 全テストパス、表示確認

- [ ] **4-5. GenerateButton（31番から流用）**
  - 31番の`GenerateButton.tsx`をそのまま流用
  - **完了条件**: 動作確認

---

## Phase 5: ローカルストレージ実装（予定工数: 3時間）

### タスク

- [ ] **5-1. ストレージユーティリティ共通化（31番から流用）**
  - 31番の`lib/storage.ts`を共通ライブラリとして配置
  - 32番用のキー追加
  - **完了条件**: 両アプリで使用可能

- [ ] **5-2. 位置情報保存機能実装（Red → Green → Refactor）**
  - `__tests__/lib/storage.test.ts`に32番用テスト追加（Red）
  - 都市選択・緯度経度の保存・読み込み実装（Green）
  - **完了条件**: 全テストがパス

- [ ] **5-3. 設定画面実装（Red → Green → Refactor）**
  - `__tests__/app/settings/page.test.tsx`作成（Red）
  - `app/settings/page.tsx`実装（Green）
  - APIキー入力、位置情報管理、データクリア（Green）
  - **完了条件**: 全テストパス、動作確認

- [ ] **5-4. 履歴・お気に入り機能統合（Refactor）**
  - メインページに履歴表示追加
  - お気に入り位置登録ボタン追加
  - **完了条件**: 全機能動作、テストパス

---

## Phase 6: PWA対応（予定工数: 2時間）

### タスク

- [ ] **6-1. next-pwa設定（31番と同様）**
  - `npm install next-pwa`
  - `next.config.js`設定
  - `public/manifest.json`作成
  - **完了条件**: ビルド成功、警告ゼロ

- [ ] **6-2. Service Worker動作確認（Green）**
  - PWAインストール確認
  - オフライン動作テスト
  - **完了条件**: オフラインで太陽計算が動作

- [ ] **6-3. アイコン作成（Green）**
  - `public/icon-192.png`作成（太陽デザイン）
  - `public/icon-512.png`作成
  - ファビコン設定
  - **完了条件**: アイコン表示確認

- [ ] **6-4. PWAメタデータ設定（Refactor）**
  - `app/layout.tsx`にメタデータ追加
  - theme-color設定（空の青）
  - **完了条件**: PWA Lighthouse スコア90以上

---

## Phase 7: 31番アプリ連携（予定工数: 3時間）

### タスク

- [ ] **7-1. 共通ナビゲーション実装（31番と共通化）**
  - `components/Navigation.tsx`を共通コンポーネント化
  - 31番・32番両方へのリンク
  - **完了条件**: 両アプリで使用可能

- [ ] **7-2. デザイン統一（Refactor）**
  - `tailwind.config.js`の共通化
  - カラーパレット統一
  - フォント・レイアウト統一
  - **完了条件**: 両アプリのデザイン一貫性確認

- [ ] **7-3. 31番アプリへの相互リンク追加（調整）**
  - 31番アプリに32番へのリンク追加
  - ナビゲーションメニュー統合
  - **完了条件**: 相互遷移動作確認

- [ ] **7-4. 共通モジュール整理（Refactor）**
  - `lib/aiService.ts`の共通化完了
  - `lib/storage.ts`の共通化完了
  - 共有ディレクトリ構成確定
  - **完了条件**: コードの重複排除、両アプリ動作確認

---

## Phase 8: 統合テスト・最終調整（予定工数: 4時間）

### タスク

- [ ] **8-1. E2Eテスト作成（Red）**
  - Playwright設定
  - `e2e/sun-movement.spec.ts`作成
  - ユーザーフロー全体のテスト
  - **完了条件**: テストが失敗することを確認

- [ ] **8-2. E2Eテスト実装（Green）**
  - 都市選択 → 日付・時刻選択 → 太陽表示の流れ
  - 緯度経度手動入力テスト
  - AI生成テスト
  - PWAインストールテスト
  - 白夜・極夜の動作確認（レイキャビク、トロムソでの夏至・冬至テスト）
  - **完了条件**: 全E2Eテストがパス

- [ ] **8-3. E2Eテストのリファクタリング（Refactor）**
  - テストコードの重複排除
  - ヘルパー関数の抽出
  - Page Objectパターン適用
  - テストの可読性・メンテナンス性向上
  - **完了条件**: E2Eテストコードが整理され、保守しやすい状態

- [ ] **8-4. パフォーマンス最適化（Refactor）**
  - Lighthouse監査実行
  - パフォーマンススコア改善
  - アクセシビリティ改善
  - **完了条件**: Lighthouse スコア90以上（全カテゴリ）

- [ ] **8-5. コードレビュー・リファクタリング（Refactor）**
  - ESLint警告ゼロ
  - TypeScript strict mode有効化
  - コードコメント追加
  - **完了条件**: 静的解析エラーゼロ

- [ ] **8-6. ドキュメント整備（完了）**
  - README.md作成
  - 開発ガイド記載
  - デプロイ手順記載
  - **完了条件**: ドキュメント完備

---

## マイルストーン

| マイルストーン | 期限目安 | 完了条件 |
|---------------|---------|---------|
| M1: テスト環境構築完了 | Day 1 | Phase 0完了、全テスト実行可能 |
| M2: コア機能実装完了 | Day 4 | Phase 1-3完了、太陽表示・UI動作 |
| M3: AI機能実装完了 | Day 6 | Phase 4完了、AI生成動作 |
| M4: データ永続化完了 | Day 7 | Phase 5完了、設定保存動作 |
| M5: PWA対応完了 | Day 8 | Phase 6完了、オフライン動作 |
| M6: 連携・統合完了 | Day 10 | Phase 7-8完了、全機能動作 |

---

## 完了基準

### 機能要件
- ✅ 日付・時刻選択（±100年対応）
- ✅ 位置情報選択（主要都市 + 緯度経度手動入力）
- ✅ 太陽の動き描画（Canvas、軌跡、アニメーション）
- ✅ 時間帯別の空の色変化
- ✅ 太陽位置情報表示（日の出・日の入り・南中・高度・方位角）
- ✅ AI生成コンテンツ（豆知識・メッセージ・日焼け対策・撮影タイミング）
- ✅ ローカルストレージ（位置・履歴・お気に入り）
- ✅ PWA（オフライン対応、インストール可能）
- ✅ 31番アプリとの連携（ナビゲーション・共通化）

### 品質要件
- ✅ 全テストパス（単体・統合・E2E）
- ✅ コードカバレッジ80%以上
- ✅ Lighthouse スコア90以上（全カテゴリ）
- ✅ TypeScriptエラーゼロ
- ✅ ESLint警告ゼロ

### ドキュメント要件
- ✅ README.md完備
- ✅ コードコメント適切
- ✅ 開発ガイド記載

---

## リスク管理

| リスク | 発生確率 | 影響度 | 対策 |
|--------|---------|--------|------|
| Canvas描画パフォーマンス低下 | 中 | 高 | 早期プロトタイプで検証 |
| 白夜・極夜の計算複雑性 | 中 | 中 | SunCalc.js使用、テストケース充実 |
| 空の色遷移の実装難易度 | 中 | 中 | グラデーション事前定義、段階的実装 |
| 31番との共通化コスト | 低 | 低 | 段階的にリファクタリング |

---

## 31番との共通化によるメリット

- **開発効率向上**: AI生成・ストレージ管理の再利用
- **保守性向上**: 共通モジュールの一元管理
- **UX統一**: 一貫したデザイン・操作性
- **将来拡張性**: 月と太陽の統合ビュー実装が容易

---

## 次ステップ

1. ✅ 実装計画書レビュー・承認
2. ⬜ 開発環境セットアップ（Phase 0開始）
3. ⬜ Claude Code on the Webで実装開始

---

**作成者**: クロ
**レビュー待ち**: あおいさん
**総予定工数**: 約33時間（10日間想定）
