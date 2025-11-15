/**
 * ローカルストレージキー定義
 */
export const STORAGE_KEYS = {
  API_KEY: 'sun-app-api-key',
  LOCATION: 'sun-app-location',
  FAVORITES: 'sun-app-favorites',
  HISTORY: 'sun-app-history',
} as const;

/**
 * APIキーを保存
 */
export function saveApiKey(apiKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
  }
}

/**
 * APIキーを読み込み
 */
export function loadApiKey(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
  }
  return null;
}

/**
 * 位置情報を保存
 */
export function saveLocation(latitude: number, longitude: number, cityName?: string): void {
  if (typeof window !== 'undefined') {
    const location = { latitude, longitude, cityName };
    localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(location));
  }
}

/**
 * 位置情報を読み込み
 */
export function loadLocation(): { latitude: number; longitude: number; cityName?: string } | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEYS.LOCATION);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * お気に入り位置を追加
 */
export function addFavoriteLocation(latitude: number, longitude: number, cityName: string): void {
  if (typeof window !== 'undefined') {
    const favorites = loadFavoriteLocations();
    const newFavorite = { latitude, longitude, cityName };

    // 重複チェック
    const exists = favorites.some(
      (fav) => fav.latitude === latitude && fav.longitude === longitude
    );

    if (!exists) {
      favorites.push(newFavorite);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    }
  }
}

/**
 * お気に入り位置を読み込み
 */
export function loadFavoriteLocations(): Array<{
  latitude: number;
  longitude: number;
  cityName: string;
}> {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
  }
  return [];
}

/**
 * お気に入り位置を削除
 */
export function removeFavoriteLocation(latitude: number, longitude: number): void {
  if (typeof window !== 'undefined') {
    const favorites = loadFavoriteLocations();
    const filtered = favorites.filter(
      (fav) => !(fav.latitude === latitude && fav.longitude === longitude)
    );
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
  }
}

/**
 * 全データをクリア
 */
export function clearAllData(): void {
  if (typeof window !== 'undefined') {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }
}
