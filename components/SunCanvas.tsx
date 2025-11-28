'use client';

import { useEffect, useRef, useMemo } from 'react';
import { calculateSunPosition } from '@/lib/sunPosition';
import {
  drawSky,
  drawSun,
  drawHorizon,
  drawCardinalDirections,
  drawAltitudeScale,
  type Position,
} from '@/lib/sunDraw';
import { horizontalToScreen, DEFAULT_VIEWPORT, type Viewport } from '@/lib/horizonProjection';

interface SunCanvasProps {
  date: Date;
  time: number;
  latitude: number;
  longitude: number;
  timeZone: string;
  width?: number;
  height?: number;
  viewAzimuth?: number;
  fov?: number;
  showSunPath?: boolean;
  showAltitudeScale?: boolean;
}

/**
 * 太陽のCanvas描画コンポーネント
 */
export default function SunCanvas({
  date,
  time,
  latitude,
  longitude,
  width = 600,
  height = 400,
  viewAzimuth = 180,
  fov = 100,
  showSunPath = true,
  showAltitudeScale = true,
  timeZone,
}: SunCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const azimuthRef = useRef(viewAzimuth);

  const sunData = useMemo(() => {
    return calculateSunPosition(date, time, latitude, longitude, timeZone);
  }, [date, time, latitude, longitude, timeZone]);

  useEffect(() => {
    azimuthRef.current = viewAzimuth;
  }, [viewAzimuth]);

  const viewport = useMemo<Viewport>(() => {
    // 地平線を画面下部87.5%（下から1/8）に配置するためのチルト角を計算
    const fovRad = (fov * Math.PI) / 180;
    const focalLength = 1 / Math.tan(fovRad / 2);
    const targetYProj = 0.75;
    const requiredTiltRad = Math.atan(targetYProj / focalLength);
    const requiredTilt = (requiredTiltRad * 180) / Math.PI;

    return {
      ...DEFAULT_VIEWPORT,
      centerAzimuth: viewAzimuth,
      centerAltitude: requiredTilt,
      fov: fov,
    };
  }, [viewAzimuth, fov]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // デバイスピクセル比対応（Retina対応）
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // 空を描画
    drawSky(ctx, width, height, time, sunData.altitude, viewport);

    // 地平線を描画（3D投影）
    drawHorizon(ctx, viewport, width, height);

    // 太陽の軌跡を描画（1時間ごとの位置）
    if (showSunPath) {
      drawSunPathWithProjection(
        ctx,
        date,
        latitude,
        longitude,
        width,
        height,
        viewport,
        timeZone
      );
    }

    // 太陽を描画（3D投影）
    if (sunData.altitude > -6) {
      const sunPos = horizontalToScreen(
        sunData.azimuth,
        sunData.altitude,
        viewport,
        width,
        height
      );

      if (sunPos) {
        const position: Position = { x: sunPos.x, y: sunPos.y };
        drawSun(ctx, position, sunData.altitude);
      }
    }

    // 方位を描画（最後に描画して、地面の上に表示）
    drawCardinalDirections(ctx, viewport, width, height);

    // 高度目盛りを描画（最前面に表示、オプション）
    if (showAltitudeScale) {
      drawAltitudeScale(ctx, viewport, width, height);
    }
  }, [sunData, width, height, viewport, time, date, latitude, longitude, showSunPath, timeZone, showAltitudeScale]);

  /**
   * 太陽の軌跡を3D投影で描画
   */
  function drawSunPathWithProjection(
    ctx: CanvasRenderingContext2D,
    date: Date,
    latitude: number,
    longitude: number,
    width: number,
    height: number,
    viewport: Viewport,
    timeZone: string
  ): void {
    const segments: Position[][] = [];
    let currentSegment: Position[] = [];

    const pushSegment = () => {
      if (currentSegment.length >= 2) {
        segments.push(currentSegment);
      }
      currentSegment = [];
    };

    const step = 0.1; // 精度向上のためステップを細かくする（6分刻み）
    for (let hour = 0; hour <= 24; hour += step) {
      const sunData = calculateSunPosition(date, hour, latitude, longitude, timeZone);
      if (sunData.altitude > -6) {
        // 画面外（カメラの後ろなど）の判定を厳密に行うため、
        // horizontalToScreenの戻り値だけでなく、投影前の座標も考慮したいが、
        // ここでは簡易的にhorizontalToScreenのnull判定と、点間の距離チェックで対応
        const pos = horizontalToScreen(
          sunData.azimuth,
          sunData.altitude,
          viewport,
          width,
          height
        );

        if (pos) {
          currentSegment.push({ x: pos.x, y: pos.y });
        } else {
          // 投影できない（視野外/カメラ後ろ）場合はセグメントを切る
          if (currentSegment.length) {
            pushSegment();
          }
        }
      } else if (currentSegment.length) {
        pushSegment();
      }
    }

    if (currentSegment.length) {
      pushSegment();
    }

    if (!segments.length) {
      return;
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    segments.forEach((segment) => {
      if (segment.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(segment[0].x, segment[0].y);

      for (let i = 1; i < segment.length; i++) {
        const p1 = segment[i - 1];
        const p2 = segment[i];

        // 点と点の距離が離れすぎている場合（画面幅の1/4以上）は描画しない
        // ステップを細かくしたので、許容距離も少し短くする
        const distSq = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
        if (distSq > (width / 4) ** 2) {
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(p2.x, p2.y);
        } else {
          ctx.lineTo(p2.x, p2.y);
        }
      }
      ctx.stroke();
    });

    ctx.setLineDash([]);
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    />
  );
}
