/**
 * 地平座標系の投影ユーティリティ
 * 透視投影（Perspective Projection）を使用
 */

const DEG2RAD = Math.PI / 180;

/**
 * 地平座標（方位角・高度）
 */
export interface HorizontalCoordinates {
  azimuth: number;  // 方位角（度、北=0、東=90、南=180、西=270）
  altitude: number; // 高度（度、地平線=0、天頂=90）
}

/**
 * スクリーン座標
 */
export interface ScreenPosition {
  x: number;
  y: number;
}

/**
 * ビューポート設定
 */
export interface Viewport {
  centerAzimuth: number;  // 視点の中心方位角（度、デフォルト180=南）
  centerAltitude: number; // 視点の中心高度（度、デフォルト30）
  fov: number;            // 視野角（度、デフォルト120）
}

/**
 * 地平座標をスクリーン座標に変換（透視投影）
 *
 * @param azimuth - 方位角（度、北=0、東=90、南=180、西=270）
 * @param altitude - 高度（度、地平線=0、天頂=90）
 * @param viewport - ビューポート設定
 * @param canvasWidth - Canvas幅
 * @param canvasHeight - Canvas高さ
 * @returns スクリーン座標（視野外の場合null）
 */
export function horizontalToScreen(
  azimuth: number,
  altitude: number,
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number
): ScreenPosition | null {
  // 地平線より下、または95度以上（天頂を超えて後ろ側）は描画しない
  if (altitude < -6 || altitude > 95) {
    return null;
  }

  // 球面座標（azimuth, altitude）を3D直交座標に変換
  const azRad = azimuth * DEG2RAD;
  const altRad = altitude * DEG2RAD;

  const x3d = Math.cos(altRad) * Math.sin(azRad);
  const y3d = Math.sin(altRad);
  const z3d = Math.cos(altRad) * Math.cos(azRad);

  // カメラの向き（centerAzimuth）に座標系を回転
  // centerAzimuthがZ軸の負の方向になるように回転
  const centerAzRad = viewport.centerAzimuth * DEG2RAD;

  // Y軸回転（方位角）
  // 元の座標系：X=東, Y=天頂, Z=北
  // カメラ座標系：Z軸が視線方向（奥がマイナス）
  const xCamBase = x3d * Math.cos(centerAzRad) - z3d * Math.sin(centerAzRad);
  const yCamBase = y3d;
  const zCamBase = x3d * Math.sin(centerAzRad) + z3d * Math.cos(centerAzRad);

  // カメラのピッチ（上下角）
  const centerAltRad = viewport.centerAltitude * DEG2RAD;
  const yCam = yCamBase * Math.cos(centerAltRad) - zCamBase * Math.sin(centerAltRad);
  const zCam = yCamBase * Math.sin(centerAltRad) + zCamBase * Math.cos(centerAltRad);
  const xCam = xCamBase;

  // カメラの後ろにある点は描画しない
  if (zCam <= 0.01) {
    return null;
  }

  // 透視投影：3D→2D変換
  const fovRad = viewport.fov * DEG2RAD;
  const focalLength = 1 / Math.tan(fovRad / 2);

  // 投影面上の座標（-1〜1の範囲）
  // xProj: 右がプラス、左がマイナス
  // yProj: 上がプラス、下がマイナス
  const xProj = (xCam / zCam) * focalLength;
  const yProj = (yCam / zCam) * focalLength;

  // 投影範囲外判定（視野角外）
  if (Math.abs(xProj) > 1 || Math.abs(yProj) > 1) {
    return null;
  }

  // スクリーン座標に変換
  // xProj: -1(左端) 〜 0(中央) 〜 1(右端)
  // yProj: -1(下端) 〜 0(中央) 〜 1(上端)
  const screenX = (xProj * 0.5 + 0.5) * canvasWidth;
  const screenY = (0.5 - yProj * 0.5) * canvasHeight;

  return { x: screenX, y: screenY };
}

/**
 * 地平線上の座標を計算（高度0度のライン）
 */
export function calculateHorizonLine(
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number,
  numPoints: number = 100
): ScreenPosition[] {
  const points: ScreenPosition[] = [];
  const halfFov = viewport.fov / 2;
  const startAz = viewport.centerAzimuth - halfFov;
  const endAz = viewport.centerAzimuth + halfFov;

  for (let i = 0; i < numPoints; i++) {
    const azimuth = startAz + (endAz - startAz) * (i / (numPoints - 1));
    const pos = horizontalToScreen(azimuth, 0, viewport, canvasWidth, canvasHeight);
    if (pos) {
      points.push(pos);
    }
  }

  return points;
}

/**
 * 方位マーカーの位置を計算（東西南北）
 */
export function calculateCardinalPoints(
  viewport: Viewport,
  canvasWidth: number,
  canvasHeight: number
): Array<{ name: string; azimuth: number; position: ScreenPosition | null }> {
  const cardinals = [
    { name: '北', azimuth: 0 },
    { name: '東', azimuth: 90 },
    { name: '南', azimuth: 180 },
    { name: '西', azimuth: 270 },
  ];

  return cardinals.map((cardinal) => ({
    name: cardinal.name,
    azimuth: cardinal.azimuth,
    position: horizontalToScreen(cardinal.azimuth, 0, viewport, canvasWidth, canvasHeight),
  }));
}

/**
 * デフォルトのビューポート設定
 */
export const DEFAULT_VIEWPORT: Viewport = {
  centerAzimuth: 180,  // 南を中心（太陽の南中方向）
  centerAltitude: 0,   // 地平線を中心
  fov: 110,            // 視野角110度
};
