import { getSkyPhase, getSkyColors } from './skyColor';

/**
 * 位置の型定義
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 空の背景を描画
 *
 * @param ctx - Canvas 2Dコンテキスト
 * @param width - Canvasの幅
 * @param height - Canvasの高さ
 * @param time - 時刻（0-24）
 * @param altitude - 太陽高度（度）
 */
export function drawSky(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  altitude: number
): void {
  // 時間帯を判定
  const skyPhase = getSkyPhase(time, altitude);
  const colors = getSkyColors(skyPhase);

  // 縦方向グラデーション（上から下へ）
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * 太陽を描画
 *
 * @param ctx - Canvas 2Dコンテキスト
 * @param position - 太陽の位置
 * @param altitude - 太陽高度（度）
 * @param baseRadius - 基準半径（デフォルト: 40）
 */
export function drawSun(
  ctx: CanvasRenderingContext2D,
  position: Position,
  altitude: number,
  baseRadius: number = 40
): void {
  // 高度に応じて半径を調整（地平線近くでは少し大きく見える）
  const radius = altitude < 10 ? baseRadius * 1.2 : baseRadius;

  // 発光効果（外側のグロー）
  const gradient = ctx.createRadialGradient(
    position.x,
    position.y,
    0,
    position.x,
    position.y,
    radius * 2.5
  );
  gradient.addColorStop(0, '#FFF5E1'); // 中心: クリーム色
  gradient.addColorStop(0.4, '#FFD700'); // ゴールド
  gradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.3)'); // 半透明ゴールド
  gradient.addColorStop(1, 'rgba(255, 215, 0, 0)'); // 透明

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius * 2.5, 0, Math.PI * 2);
  ctx.fill();

  // 太陽本体
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
  ctx.fill();

  // 太陽の縁（わずかに明るく）
  ctx.fillStyle = '#FFF8DC';
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius * 0.7, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 太陽の軌跡を描画
 *
 * @param ctx - Canvas 2Dコンテキスト
 * @param width - Canvasの幅
 * @param height - Canvasの高さ
 * @param sunrisePos - 日の出位置
 * @param sunsetPos - 日の入り位置
 */
export function drawSunPath(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sunrisePos: Position,
  sunsetPos: Position
): void {
  // 軌跡のパスを描画（点線）
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);

  ctx.beginPath();
  ctx.moveTo(sunrisePos.x, sunrisePos.y);

  // 弧を描く（ベジェ曲線を使用）
  const controlY = Math.min(sunrisePos.y, sunsetPos.y) - height * 0.3;
  ctx.quadraticCurveTo(
    width / 2,
    controlY,
    sunsetPos.x,
    sunsetPos.y
  );

  ctx.stroke();
  ctx.setLineDash([]); // 点線をリセット

  // 日の出マーカー
  drawMarker(ctx, sunrisePos, '🌅', '#FF6B35');

  // 日の入りマーカー
  drawMarker(ctx, sunsetPos, '🌇', '#FF4E50');
}

/**
 * マーカーを描画
 *
 * @param ctx - Canvas 2Dコンテキスト
 * @param position - マーカー位置
 * @param emoji - 表示する絵文字
 * @param color - マーカーの色
 */
function drawMarker(
  ctx: CanvasRenderingContext2D,
  position: Position,
  emoji: string,
  color: string
): void {
  // 小さな円を描画
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(position.x, position.y, 8, 0, Math.PI * 2);
  ctx.fill();

  // 白い縁取り
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 絵文字テキスト（オプション）
  ctx.font = '20px sans-serif';
  ctx.fillText(emoji, position.x - 10, position.y - 15);
}

/**
 * 方位角と高度からCanvas上の位置を計算
 *
 * @param azimuth - 方位角（度、0=北、90=東、180=南、270=西）
 * @param altitude - 高度（度）
 * @param width - Canvasの幅
 * @param height - Canvasの高さ
 * @returns Canvas上の位置
 */
export function calculateSunPositionOnCanvas(
  azimuth: number,
  altitude: number,
  width: number,
  height: number
): Position {
  // 高度を0-90度の範囲に正規化（負の値は地平線下なので地平線上として扱う）
  const clampedAltitude = Math.max(0, Math.min(90, altitude));

  // Y座標: 高度が高いほど上に（0度=地平線=height*0.8、90度=天頂=height*0.1）
  const y = height * (0.8 - (clampedAltitude / 90) * 0.7);

  // X座標: 方位角から計算（90度=東=左、270度=西=右）
  // 方位角を-90度シフトして、90度（東）を0度として扱う
  const adjustedAzimuth = (azimuth - 90 + 360) % 360;

  // 180度の範囲で左から右へマッピング（東0度→左端、西180度→右端）
  const normalizedAzimuth = adjustedAzimuth > 180 ? 360 - adjustedAzimuth : adjustedAzimuth;
  const x = width * (normalizedAzimuth / 180);

  return { x, y };
}
