'use client';

import { useEffect, useRef } from 'react';
import { calculateSunPosition } from '@/lib/sunPosition';
import { drawSky, drawSun, drawSunPath, calculateSunPositionOnCanvas } from '@/lib/sunDraw';

interface SunCanvasProps {
  date: Date;
  time: number;
  latitude: number;
  longitude: number;
  width?: number;
  height?: number;
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
}: SunCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    // 太陽位置を計算
    const sunData = calculateSunPosition(date, time, latitude, longitude);

    // 空を描画
    drawSky(ctx, width, height, time, sunData.altitude);

    // 太陽の軌跡を描画（日の出・日の入り位置）
    const sunriseData = calculateSunPosition(date, sunData.sunrise.getHours(), latitude, longitude);
    const sunsetData = calculateSunPosition(date, sunData.sunset.getHours(), latitude, longitude);

    const sunrisePos = calculateSunPositionOnCanvas(
      sunriseData.azimuth,
      0, // 地平線上
      width,
      height
    );

    const sunsetPos = calculateSunPositionOnCanvas(
      sunsetData.azimuth,
      0, // 地平線上
      width,
      height
    );

    const currentPos = calculateSunPositionOnCanvas(
      sunData.azimuth,
      sunData.altitude,
      width,
      height
    );

    drawSunPath(ctx, width, height, sunrisePos, sunsetPos);

    // 太陽を描画
    if (sunData.altitude > -6) {
      // 太陽が地平線下6度より上にある場合のみ描画
      drawSun(ctx, currentPos, sunData.altitude);
    }
  }, [date, time, latitude, longitude, width, height]);

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
