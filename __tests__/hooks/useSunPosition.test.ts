import { renderHook, act } from '@testing-library/react';
import { useSunPosition } from '@/hooks/useSunPosition';

describe('useSunPosition', () => {
  it('初期状態で東京の現在時刻の太陽位置を計算する', () => {
    const { result } = renderHook(() => useSunPosition());

    expect(result.current.sunData).toBeDefined();
    expect(result.current.sunData.latitude).toBe(35.6762); // 東京の緯度
    expect(result.current.sunData.longitude).toBe(139.6503); // 東京の経度
  });

  it('日付を変更すると太陽位置が再計算される', () => {
    const { result } = renderHook(() => useSunPosition());

    const initialDayLength = result.current.sunData.dayLength;

    act(() => {
      // 夏至に変更
      result.current.setDate(new Date(2025, 5, 21));
    });

    // 夏至の方が昼が長い
    expect(result.current.sunData.dayLength).toBeGreaterThan(initialDayLength);
  });

  it('時刻を変更すると太陽高度が変化する', () => {
    const { result } = renderHook(() => useSunPosition());

    act(() => {
      // 正午に設定
      result.current.setTime(3); // UTC 3時 = JST 12時
    });

    const noonAltitude = result.current.sunData.altitude;

    act(() => {
      // 夕方に設定
      result.current.setTime(8); // UTC 8時 = JST 17時
    });

    // 夕方の方が太陽が低い
    expect(result.current.sunData.altitude).toBeLessThan(noonAltitude);
  });

  it('位置を変更すると太陽位置が再計算される', () => {
    const { result } = renderHook(() => useSunPosition());

    act(() => {
      // シンガポール（赤道付近）に変更
      result.current.setLocation(1.3521, 103.8198);
    });

    expect(result.current.sunData.latitude).toBe(1.3521);
    expect(result.current.sunData.longitude).toBe(103.8198);
    // 赤道付近では昼の長さが約12時間
    expect(result.current.sunData.dayLength).toBeGreaterThan(11.5);
    expect(result.current.sunData.dayLength).toBeLessThan(12.5);
  });

  it('極地方の条件を取得できる', () => {
    const { result } = renderHook(() => useSunPosition());

    expect(result.current.polarCondition).toBe('normal');
  });
});
