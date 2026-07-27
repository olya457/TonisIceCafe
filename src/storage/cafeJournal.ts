import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = '@tonis-ice-cafe/guest-journal-v1';
const PREVIOUS_PROGRESS_KEY = '@tiny-ice-cafe/progress-v2';
const LEGACY_PROGRESS_KEY = '@tiny-ice-cafe/progress-v1';

export type SavedProgress = {
  cookingLevel: number;
  highestCookingLevel: number;
  fishingLevel: number;
  highestFishingLevel: number;
  cookingCoins: number;
  fishingCoins: number;
  purchasedShopItems: string[];
  hearts?: number;
  lastHeartRefreshDate?: string;
};

export async function loadProgress(): Promise<SavedProgress | null> {
  try {
    const value = await AsyncStorage.getItem(PROGRESS_KEY);
    if (value) return JSON.parse(value) as SavedProgress;

    const previousValue = await AsyncStorage.getItem(PREVIOUS_PROGRESS_KEY);
    if (previousValue) {
      const previous = JSON.parse(previousValue) as Omit<
        SavedProgress,
        'cookingCoins' | 'fishingCoins' | 'purchasedShopItems'
      > & {coins: number};

      return {
        ...previous,
        cookingCoins: Math.max(previous.coins, 0),
        fishingCoins: 0,
        purchasedShopItems: [],
      };
    }

    const legacyValue = await AsyncStorage.getItem(LEGACY_PROGRESS_KEY);
    if (!legacyValue) return null;
    const legacy = JSON.parse(legacyValue) as {
      currentLevel: number;
      highestUnlockedLevel: number;
      coins: number;
    };
    return {
      cookingLevel: legacy.currentLevel,
      highestCookingLevel: legacy.highestUnlockedLevel,
      fishingLevel: 1,
      highestFishingLevel: 1,
      cookingCoins: legacy.coins,
      fishingCoins: 0,
      purchasedShopItems: [],
    };
  } catch {
    return null;
  }
}

export async function saveProgress(progress: SavedProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {}
}
