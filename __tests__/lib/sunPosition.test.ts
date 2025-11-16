import { calculateSunPosition, checkPolarConditions } from '@/lib/sunPosition';

describe('太陽位置計算ロジック', () => {
  describe('calculateSunPosition', () => {
    it('東京の2025年1月13日正午頃の太陽位置を計算できる', () => {
      // 2025年1月13日
      const date = new Date(2025, 0, 13);
      // 東京の正午（現地時間）で計算
      const result = calculateSunPosition(date, 12, 35.6762, 139.6503, 'Asia/Tokyo');

      // 基本情報の確認
      expect(result.date).toEqual(date);
      expect(result.time).toBe(12);
      expect(result.latitude).toBe(35.6762);
      expect(result.longitude).toBe(139.6503);

      // 太陽高度（冬の東京の正午なので30度前後）
      expect(result.altitude).toBeGreaterThan(25);
      expect(result.altitude).toBeLessThan(40);

      // 方位角は0度以上360度未満
      expect(result.azimuth).toBeGreaterThanOrEqual(0);
      expect(result.azimuth).toBeLessThan(360);

      // 昼の長さは冬なので10時間前後
      expect(result.dayLength).toBeGreaterThan(9);
      expect(result.dayLength).toBeLessThan(11);
    });

    it('夏至の東京では昼の長さが長い', () => {
      const summerSolstice = new Date(2025, 5, 21); // 2025年6月21日
      const result = calculateSunPosition(summerSolstice, 12, 35.6762, 139.6503, 'Asia/Tokyo');

      // 夏至の昼の長さは14時間程度
      expect(result.dayLength).toBeGreaterThan(14);
      expect(result.dayLength).toBeLessThan(15);
    });

    it('冬至の東京では昼の長さが短い', () => {
      const winterSolstice = new Date(2025, 11, 22); // 2025年12月22日
      const result = calculateSunPosition(winterSolstice, 12, 35.6762, 139.6503, 'Asia/Tokyo');

      // 冬至の昼の長さは10時間程度
      expect(result.dayLength).toBeGreaterThan(9);
      expect(result.dayLength).toBeLessThan(11);
    });

    it('赤道直下（シンガポール）では一年中昼の長さがほぼ12時間', () => {
      const date = new Date(2025, 0, 13); // 2025年1月13日
      const result = calculateSunPosition(date, 12, 1.3521, 103.8198, 'Asia/Singapore');

      // 赤道付近では昼の長さは約12時間
      expect(result.dayLength).toBeGreaterThan(11.5);
      expect(result.dayLength).toBeLessThan(12.5);
    });

    it('南半球（シドニー）では季節が逆転する', () => {
      const june = new Date(2025, 5, 21); // 2025年6月21日（南半球の冬）
      const resultWinter = calculateSunPosition(june, 12, -33.8688, 151.2093, 'Australia/Sydney');

      const december = new Date(2025, 11, 22); // 2025年12月22日（南半球の夏）
      const resultSummer = calculateSunPosition(december, 12, -33.8688, 151.2093, 'Australia/Sydney');

      // 南半球では6月（冬）の昼が短く、12月（夏）の昼が長い
      expect(resultWinter.dayLength).toBeLessThan(resultSummer.dayLength);
    });
  });

  describe('checkPolarConditions', () => {
    it('通常の地域では normal を返す', () => {
      const sunrise = new Date('2025-01-13T06:45:00');
      const sunset = new Date('2025-01-13T16:45:00');

      const result = checkPolarConditions(sunrise, sunset);
      expect(result).toBe('normal');
    });

    it('白夜（太陽が沈まない）の場合は polar_day を返す', () => {
      // Invalid Dateは日の出・日の入りがない状態を示す
      const sunrise = new Date('2025-06-21T00:00:00');
      const sunset = new Date('Invalid Date');

      const result = checkPolarConditions(sunrise, sunset);
      expect(result).toBe('polar_day');
    });

    it('極夜（太陽が昇らない）の場合は polar_night を返す', () => {
      const sunrise = new Date('Invalid Date');
      const sunset = new Date('2025-12-21T12:00:00');

      const result = checkPolarConditions(sunrise, sunset);
      expect(result).toBe('polar_night');
    });

    it('両方Invalidの場合は polar_night を返す', () => {
      const sunrise = new Date('Invalid Date');
      const sunset = new Date('Invalid Date');

      const result = checkPolarConditions(sunrise, sunset);
      expect(result).toBe('polar_night');
    });
  });
});
