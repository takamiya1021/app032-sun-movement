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
  timeZone: string;
  width?: number;
  height?: number;
  viewAzimuth?: number;
  fov?: number;
  onViewAzimuthChange?: (azimuth: number) => void;
  followSun?: boolean;
  autoCamera?: boolean;
  showSunPath?: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function computeCameraTilt(altitude: number): number {
  if (altitude < -10) {
    return -12;
  }
  if (altitude < 5) {
    return altitude * 0.5 - 4;
  }
  if (altitude < 45) {
    return -1 + (altitude - 5) * 0.8;
  }
  if (altitude < 70) {
    return 31 + (altitude - 45) * 0.9;
  }
  return 53 + (altitude - 70) * 0.6;
}

function computeDynamicFov(altitude: number, baseFov: number): number {
  const maxFov = clamp(baseFov, 90, 130);
  const minFov = 68;
  if (altitude <= 0) {
    return maxFov;
  }
  const ratio = Math.min(altitude / 90, 1);
  const adjusted = maxFov - (maxFov - minFov) * ratio;
  return clamp(adjusted, minFov, maxFov);
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
  autoCamera = true,
  showSunPath = true,
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
    const tilt = autoCamera ? computeCameraTilt(sunData.altitude) : DEFAULT_VIEWPORT.centerAltitude;
    const dynamicFov = autoCamera ? computeDynamicFov(sunData.altitude, fov) : fov;

    return {
      ...DEFAULT_VIEWPORT,
      centerAzimuth: viewAzimuth,
      centerAltitude: clamp(tilt, -10, 50),
      fov: dynamicFov,
    };
  }, [viewAzimuth, fov, autoCamera, sunData.altitude]);

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

    // 地平線と方位を描画（3D投影）
    drawHorizon(ctx, viewport, width, height);
    drawCardinalDirections(ctx, viewport, width, height);

    // 山のシルエットを描画
    drawMountainSilhouettes(ctx, viewport, width, height);

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
  }, [sunData, width, height, viewport, time, date, latitude, longitude, showSunPath, timeZone]);

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

    const step = 0.5;
    for (let hour = 0; hour <= 24; hour += step) {
      const sunData = calculateSunPosition(date, hour, latitude, longitude, timeZone);
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
