'use client';

import { useState, useEffect, useRef } from 'react';

interface AnimationControlsProps {
  time: number;
  onTimeChange: (time: number) => void;
}

type PlaybackSpeed = 1 | 2 | 5 | 10;

/**
 * アニメーションコントロールコンポーネント
 * 再生/一時停止/早送り/巻き戻しボタンを提供
 */
export default function AnimationControls({
  time,
  onTimeChange,
}: AnimationControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  // アニメーションループ
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = () => {
      const now = Date.now();
      const deltaSeconds = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // 1秒で1時間進む（速度調整あり）
      const deltaTime = deltaSeconds * speed * (direction === 'forward' ? 1 : -1);
      let newTime = time + deltaTime;

      // 24時間でループ
      if (newTime >= 24) {
        newTime = newTime % 24;
      } else if (newTime < 0) {
        newTime = 24 + (newTime % 24);
      }

      onTimeChange(newTime);
      animationRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = Date.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, speed, direction, time, onTimeChange]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    setDirection('forward');
  };

  const handleFastForward = () => {
    setDirection('forward');
    setSpeed(2);
    setIsPlaying(true);
  };

  const handleRewind = () => {
    setDirection('backward');
    setSpeed(2);
    setIsPlaying(true);
  };

  const handleSpeedChange = (newSpeed: PlaybackSpeed) => {
    setSpeed(newSpeed);
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {/* 巻き戻しボタン */}
      <button
        onClick={handleRewind}
        className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-lg"
        title="巻き戻し"
      >
        ⏪
      </button>

      {/* 再生/一時停止ボタン */}
      <button
        onClick={handlePlayPause}
        className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-lg font-bold"
        title={isPlaying ? '一時停止' : '再生'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      {/* 早送りボタン */}
      <button
        onClick={handleFastForward}
        className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-lg"
        title="早送り"
      >
        ⏩
      </button>

      {/* 速度調整（同じ行に配置） */}
      <select
        value={speed}
        onChange={(e) => handleSpeedChange(Number(e.target.value) as PlaybackSpeed)}
        className="px-2 py-2 border border-gray-300 rounded-md bg-white text-xs"
        title="再生速度"
      >
        <option value={1}>1x</option>
        <option value={2}>2x</option>
        <option value={5}>5x</option>
        <option value={10}>10x</option>
      </select>
    </div>
  );
}
