'use client';

import { useEffect, useRef, useMemo } from 'react';
import { calculateSunPosition } from '@/lib/sunPosition';
import {
  drawSky,
  drawSun,
  drawHorizon,
  drawCardinalDirections,
  drawMountainSilhouettes,
  type Position,
} from '@/lib/sunDraw';
import { horizontalToScreen, DEFAULT_VIEWPORT, type Viewport } from '@/lib/horizonProjection';

interface SunCanvasProps {
  date: Date;
  time: number;
  latitude: number;
  longitude: number;
  width?: number;
  height?: number;
  viewAzimuth?: number;
  fov?: number;
  onViewAzimuthChange?: (azimuth: number) => void;
  followSun?: boolean;
}

const normalizeAngle = (value: number) => {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

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
  fov = 120,
  onViewAzimuthChange,
  followSun = false,
}: SunCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const azimuthRef = useRef(viewAzimuth);

  useEffect(() => {
    azimuthRef.current = viewAzimuth;
  }, [viewAzimuth]);

  const viewport = useMemo<Viewport>(() => {
    return {
      ...DEFAULT_VIEWPORT,
      centerAzimuth: viewAzimuth,
      fov,
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

    // 太陽位置を計算
    const sunData = calculateSunPosition(date, time, latitude, longitude);

    // 空を描画
    drawSky(ctx, width, height, time, sunData.altitude, viewport);

    // 地平線と方位を描画（3D投影）
    drawHorizon(ctx, viewport, width, height);
    drawCardinalDirections(ctx, viewport, width, height);

    // 山のシルエットを描画
    drawMountainSilhouettes(ctx, viewport, width, height);

    // 太陽の軌跡を描画（1時間ごとの位置）
    drawSunPathWithProjection(
      ctx,
      date,
      latitude,
      longitude,
      width,
      height,
      viewport
    );

    // 太陽を描画（3D投影）
    if (sunData.altitude > -6) {
      // 太陽が地平線下6度より上にある場合のみ描画
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
  }, [date, time, latitude, longitude, width, height, viewport]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onViewAzimuthChange || followSun) return;

    let isDragging = false;
    let lastX = 0;

    const handlePointerDown = (event: PointerEvent) => {
      isDragging = true;
      lastX = event.clientX;
      canvas.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = event.clientX - lastX;
      lastX = event.clientX;

      const degreesPerPixel = fov / width;
      const deltaDegrees = deltaX * degreesPerPixel;
      const nextAzimuth = normalizeAngle(azimuthRef.current + deltaDegrees);
      azimuthRef.current = nextAzimuth;
      onViewAzimuthChange(nextAzimuth);
    };

    const stopDragging = (event: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      canvas.releasePointerCapture?.(event.pointerId);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', stopDragging);
    canvas.addEventListener('pointerleave', stopDragging);
    canvas.addEventListener('pointercancel', stopDragging);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', stopDragging);
      canvas.removeEventListener('pointerleave', stopDragging);
      canvas.removeEventListener('pointercancel', stopDragging);
    };
  }, [onViewAzimuthChange, fov, width, followSun]);

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
    viewport: Viewport
  ): void {
    const segments: Position[][] = [];
    let currentSegment: Position[] = [];

    const pushSegment = () => {
      if (currentSegment.length >= 2) {
        segments.push(currentSegment);
      }
      currentSegment = [];
    };

    const step = 0.5;
    for (let hour = 0; hour <= 24; hour += step) {
      const sunData = calculateSunPosition(date, hour, latitude, longitude);
      if (sunData.altitude > -6) {
        const pos = horizontalToScreen(
          sunData.azimuth,
          sunData.altitude,
          viewport,
          width,
          height
        );
        if (pos) {
          currentSegment.push({ x: pos.x, y: pos.y });
        } else if (currentSegment.length) {
          pushSegment();
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
      ctx.beginPath();
      ctx.moveTo(segment[0].x, segment[0].y);
      for (let i = 1; i < segment.length; i++) {
        ctx.lineTo(segment[i].x, segment[i].y);
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
