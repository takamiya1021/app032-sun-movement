/**
 * 空の色相タイプ
 */
export type SkyPhase = 'beforeDawn' | 'sunrise' | 'daytime' | 'sunset' | 'night';

/**
 * 時間帯別の空の色定義
 * グラデーションは上から下へ（空の上部から地平線に向かって）
 */
export const SKY_COLORS: Record<SkyPhase, string[]> = {
  // 夜明け前：深い青〜紫
  beforeDawn: ['#0a0e27', '#1a1f3a', '#2a3a5a'],

  // 朝焼け：オレンジ〜黄色
  sunrise: ['#FF6B35', '#F7931E', '#FDC830'],

  // 昼：明るい青空
  daytime: ['#87CEEB', '#5BA3D0', '#4A90E2'],

  // 夕焼け：オレンジ〜赤
  sunset: ['#FF6B35', '#FF4E50', '#FC913A'],

  // 夜：濃紺〜黒
  night: ['#0a0a1a', '#1a1a2e', '#16213e'],
};

/**
 * 太陽高度と時刻から空の色相フェーズを判定
 *
 * @param hour - 時刻（0-24）
 * @param altitude - 太陽高度（度）
 * @returns 空の色相フェーズ
 */
export function getSkyPhase(hour: number, altitude: number): SkyPhase {
  // 太陽が地平線下6度以下 → 完全な夜
  if (altitude < -6) {
    return 'night';
  }

  // 太陽が地平線下（-6度〜0度）
  if (altitude < 0) {
    // 午前中（0時〜12時）→ 夜明け前
    if (hour < 12) {
      return 'beforeDawn';
    }
    // 午後（12時〜24時）→ 夜
    return 'night';
  }

  // 太陽が地平線上だが低い（0度〜6度）
  if (altitude < 6) {
    // 午前中（0時〜12時）→ 朝焼け
    if (hour < 12) {
      return 'sunrise';
    }
    // 午後（12時〜24時）→ 夕焼け
    return 'sunset';
  }

  // 太陽が6度以上 → 昼
  return 'daytime';
}

/**
 * 空の色配列を取得
 *
 * @param phase - 空の色相フェーズ
 * @returns 色配列
 */
export function getSkyColors(phase: SkyPhase): string[] {
  return SKY_COLORS[phase];
}

/**
 * 2つの色相間で補間された色を取得（アニメーション用）
 *
 * @param from - 開始フェーズ
 * @param to - 終了フェーズ
 * @param progress - 進捗（0.0〜1.0）
 * @returns 補間された色配列
 */
export function interpolateSkyColors(
  from: SkyPhase,
  to: SkyPhase,
  progress: number
): string[] {
  const fromColors = SKY_COLORS[from];
  const toColors = SKY_COLORS[to];

  // 両方の色配列の長さを揃える（短い方に合わせる）
  const minLength = Math.min(fromColors.length, toColors.length);

  return Array.from({ length: minLength }, (_, i) => {
    return interpolateColor(fromColors[i], toColors[i], progress);
  });
}

/**
 * 2つの色を補間
 *
 * @param color1 - 開始色（#RRGGBB形式）
 * @param color2 - 終了色（#RRGGBB形式）
 * @param progress - 進捗（0.0〜1.0）
 * @returns 補間された色
 */
function interpolateColor(color1: string, color2: string, progress: number): string {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * progress);
  const g = Math.round(g1 + (g2 - g1) * progress);
  const b = Math.round(b1 + (b2 - b1) * progress);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
