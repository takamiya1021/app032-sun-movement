import { getSkyPhase, getSkyColors } from './skyColor';
import { calculateCardinalPoints, horizontalToScreen, type Viewport } from './horizonProjection';

/**
 * 位置の型定義
 */
export interface Position {
  x: number;
  y: number;
}

const shortestAngle = (value: number) => {
  const normalized = ((value + 180) % 360) - 180;
  return normalized < -180 ? normalized + 360 : normalized;
};

/**
 * 空の背景を描画（地平座標系対応版）
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
  altitude: number,
  viewport: Viewport
): void {
  // 時間帯を判定
  const skyPhase = getSkyPhase(time, altitude);
  const colors = getSkyColors(skyPhase);

  // 縦方向グラデーション（天頂から地平線へ）
  // 地平線は下部87.5%あたりに配置されるため、そこまでグラデーション
  const gradient = ctx.createLinearGradient(0, 0, 0, height * 0.875);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const diffFromSouth = shortestAngle(viewport.centerAzimuth - 180);
  const pixelsPerDegree = width / viewport.fov;
  const offsetX = diffFromSouth * pixelsPerDegree;
  const highlightX = width * 0.5 - offsetX;

  const radialGradient = ctx.createRadialGradient(
    highlightX,
    height * 0.2,
    width * 0.05,
    highlightX,
    height * 0.25,
    width * 0.9
  );
  radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
  radialGradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.12)');
  radialGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.05)');
  radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, width, height * 0.8);

  // 地平線下部は少し暗くする
  const groundGradient = ctx.createLinearGradient(
    highlightX - width * 0.1,
    height * 0.875,
    highlightX + width * 0.1,
    height
  );
  groundGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  groundGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, height * 0.875, width, height * 0.125);
}

/**
 * 太陽を描画（地平座標系対応版）
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
  // 高度に応じて半径を調整
  // 地平線近く（0-10度）: 1.5倍（視差効果）
  // 中間（10-45度）: 1.0-1.2倍
  // 天頂近く（45-90度）: 1.0倍
  let radiusMultiplier = 1.0;
  if (altitude < 10) {
    radiusMultiplier = 1.5 - (altitude / 10) * 0.3; // 1.5 → 1.2
  } else if (altitude < 45) {
    radiusMultiplier = 1.2 - ((altitude - 10) / 35) * 0.2; // 1.2 → 1.0
  }
  const radius = baseRadius * radiusMultiplier;

  // 発光効果の強度も高度で調整
  // 地平線近く: より強く（朝焼け・夕焼け効果）
  // 天頂: 標準
  const glowIntensity = altitude < 15 ? 1.5 : 1.0;
  const glowRadius = radius * 2.5 * glowIntensity;

  // 発光効果（外側のグロー）
  const gradient = ctx.createRadialGradient(
    position.x,
    position.y,
    0,
    position.x,
    position.y,
    glowRadius
  );

  // 地平線近くは暖色系を強調
  if (altitude < 15) {
    gradient.addColorStop(0, '#FFF5E1'); // 中心: クリーム色
    gradient.addColorStop(0.3, '#FFD700'); // ゴールド
    gradient.addColorStop(0.5, '#FF8C00'); // オレンジ
    gradient.addColorStop(0.7, 'rgba(255, 140, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
  } else {
    gradient.addColorStop(0, '#FFF5E1'); // 中心: クリーム色
    gradient.addColorStop(0.4, '#FFD700'); // ゴールド
    gradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
  }

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(position.x, position.y, glowRadius, 0, Math.PI * 2);
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

  // Y座標: 高度が高いほど上に（0度=地平線=height*0.875、90度=天頂=height*0.1）
  const y = height * (0.875 - (clampedAltitude / 90) * 0.775);

  // X座標: 方位角から計算（90度=東=左、270度=西=右）
  // 方位角を-90度シフトして、90度（東）を0度として扱う
  const adjustedAzimuth = (azimuth - 90 + 360) % 360;

  // 180度の範囲で左から右へマッピング（東0度→左端、西180度→右端）
  const normalizedAzimuth = adjustedAzimuth > 180 ? 360 - adjustedAzimuth : adjustedAzimuth;
  const x = width * (normalizedAzimuth / 180);

  return { x, y };
}

/**
 * 地平線を描画（シンプルな水平線）
 *
 * @param ctx - Canvas 2Dコンテキスト
 * @param viewport - ビューポート設定
 * @param canvasWidth - Canvas幅
 * @param canvasHeight - Canvas高さ
 */
export function drawHorizon(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number
): void {
  // 地平線は画面下部87.5%の位置に固定
  const horizonY = canvasHeight * 0.875;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, horizonY);
  ctx.lineTo(canvasWidth, horizonY);
  ctx.stroke();
}

/**
 * 方位（東西南北）を描画
 *
 * @param ctx - Canvas 2Dコンテキスト
 * @param viewport - ビューポート設定
 * @param canvasWidth - Canvas幅
 * @param canvasHeight - Canvas高さ
 */
export function drawCardinalDirections(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number
): void {
  const cardinals = calculateCardinalPoints(viewport, canvasWidth, canvasHeight);

  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  cardinals.forEach(({ name, position }) => {
    if (!position) return;

    const labelY = position.y + 10;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.strokeText(name, position.x, labelY);
    ctx.fillText(name, position.x, labelY);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(position.x, position.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}


/**
 * 風景画像（地面のテクスチャ）を描画
 *
 * @param ctx - Canvas 2Dコンテキスト
 * @param image - 描画する画像オブジェクト
 * @param viewport - ビューポート設定
 * @param canvasWidth - Canvas幅
 * @param canvasHeight - Canvas高さ
 */
export function drawLandscapeImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number
): void {
  const horizonY = canvasHeight * 0.875;
  const diffFromSouth = shortestAngle(viewport.centerAzimuth - 180);
  const pixelsPerDegree = canvasWidth / viewport.fov;

  // 画像の表示サイズ計算
  // 拡大禁止：画像は元のサイズまたは縮小のみ
  const scale = Math.min(1, canvasWidth / image.width); // 最大でも等倍まで
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;

  // 画像のY位置（地平線に合わせる）
  // 画像の上端を地平線（horizonY）に合わせる
  const drawY = horizonY;

  // X方向のオフセット（南を基準に）
  const offset = diffFromSouth * pixelsPerDegree;

  // 画像を繰り返し描画してパノラマ効果を作る
  // つなぎ目を自然にするため、奇数番目のタイルは左右反転して描画（ミラーリング）
  const startX = -drawWidth - (offset % drawWidth);

  for (let x = startX; x < canvasWidth; x += drawWidth) {
    // タイルのインデックスを計算（世界座標系での位置）
    // x + offset が世界座標でのピクセル位置
    // 多少の誤差を考慮して Math.round を使用
    const tileIndex = Math.floor(Math.round(x + offset) / Math.round(drawWidth));

    ctx.save();
    if (Math.abs(tileIndex) % 2 !== 0) {
      // 奇数番目は左右反転
      ctx.translate(x + drawWidth, drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(image, 0, 0, drawWidth, drawHeight);
    } else {
      // 偶数番目はそのまま
      ctx.drawImage(image, x, drawY, drawWidth, drawHeight);
    }
    ctx.restore();
  }
}

/**
 * 高度目盛りを描画（0-90度）
 *
 * @param ctx - Canvas 2Dコンテキスト
 * @param viewport - ビューポート設定
 * @param width - Canvas幅
 * @param height - Canvas高さ
 */
export function drawAltitudeScale(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  width: number,
  height: number
): void {
  try {
    const centerAzimuth = viewport.centerAzimuth;

    // 白色で控えめに表示
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // console.log('Drawing Altitude Scale', { centerAzimuth, width, height });

    // 10度刻みで目盛りを描画
    for (let alt = 0; alt <= 90; alt += 10) {
      const pos = horizontalToScreen(centerAzimuth, alt, viewport, width, height);

      if (pos) {
        const y = pos.y;
        // console.log(`Alt: ${alt}, Y: ${y}`);

        // 目盛り線
        ctx.beginPath();
        ctx.moveTo(5, y);
        ctx.lineTo(20, y);
        ctx.stroke();

        // 数値
        ctx.fillText(`${alt}°`, 25, y);
      } else {
        // console.log(`Alt: ${alt} is off-screen`);
      }
    }
  } catch (e) {
    console.error('Error in drawAltitudeScale:', e);
  }
}
