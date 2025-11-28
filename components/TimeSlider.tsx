'use client';

interface TimeSliderProps {
  time: number;
  onChange: (time: number) => void;
}

/**
 * 時刻選択スライダーコンポーネント
 */
export default function TimeSlider({ time, onChange }: TimeSliderProps) {
  const formatTime = (hour: number) => {
    const h = Math.floor(hour);
    const m = Math.floor((hour % 1) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleNowClick = () => {
    const now = new Date();
    onChange(now.getHours() + now.getMinutes() / 60);
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center h-[28px]">
        <label className="text-sm font-medium text-gray-700">
          ⏰ 時刻: {formatTime(time)}
        </label>
        <button
          onClick={handleNowClick}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          現在時刻
        </button>
      </div>
      <input
        type="range"
        min="0"
        max="24"
        step="0.25"
        value={time}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>0:00</span>
        <span>6:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
}
