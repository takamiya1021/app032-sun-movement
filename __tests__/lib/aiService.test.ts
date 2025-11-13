import {
  generateSunTrivia,
  generateSunMessage,
  generateUVAdvice,
  generatePhotoTiming,
  generateAllSunContent,
} from '@/lib/aiService';
import type { SunPositionData } from '@/types/sun';

// モックのSunPositionData
const mockSunData: SunPositionData = {
  date: new Date(2025, 0, 13),
  time: 12,
  latitude: 35.6762,
  longitude: 139.6503,
  altitude: 32.5,
  azimuth: 180,
  sunrise: new Date(2025, 0, 13, 6, 52),
  sunset: new Date(2025, 0, 13, 16, 49),
  solarNoon: new Date(2025, 0, 13, 11, 51),
  dayLength: 9.95,
};

describe('AIサービス', () => {
  describe('generateSunTrivia', () => {
    it('太陽の豆知識を生成するプロンプトを作成できる', () => {
      const prompt = generateSunTrivia(mockSunData, '東京');

      expect(prompt).toContain('太陽');
      expect(prompt).toContain('東京');
      expect(prompt).toBeTruthy();
    });
  });

  describe('generateSunMessage', () => {
    it('太陽のメッセージを生成するプロンプトを作成できる', () => {
      const prompt = generateSunMessage(mockSunData, '東京');

      expect(prompt).toContain('太陽');
      expect(prompt).toContain('東京');
      expect(prompt).toBeTruthy();
    });
  });

  describe('generateUVAdvice', () => {
    it('紫外線対策アドバイスを生成するプロンプトを作成できる', () => {
      const prompt = generateUVAdvice(mockSunData, '東京');

      expect(prompt).toContain('紫外線');
      expect(prompt).toBeTruthy();
    });
  });

  describe('generatePhotoTiming', () => {
    it('撮影タイミングを生成するプロンプトを作成できる', () => {
      const prompt = generatePhotoTiming(mockSunData, '東京');

      expect(prompt).toContain('撮影');
      expect(prompt).toBeTruthy();
    });
  });

  describe('generateAllSunContent', () => {
    it('APIキーがない場合はエラーを返す', async () => {
      await expect(
        generateAllSunContent(mockSunData, '東京', '')
      ).rejects.toThrow('APIキーが設定されていません');
    });

    // 実際のAPI呼び出しのテストはスキップ（モックを使用する場合はここに追加）
    it.skip('有効なAPIキーで全コンテンツを生成できる', async () => {
      const apiKey = 'test-api-key';
      const result = await generateAllSunContent(mockSunData, '東京', apiKey);

      expect(result).toHaveProperty('trivia');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('uvAdvice');
      expect(result).toHaveProperty('photoTiming');
      expect(result).toHaveProperty('generatedAt');
    });
  });
});
