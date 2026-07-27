import React, {useEffect, useRef, useState} from 'react';
import {Animated, AppState, Platform, StyleSheet, View} from 'react-native';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {enableScreens} from 'react-native-screens';
import Video from 'react-native-video';
import {cafeAudioVisuals} from './src/assets';
import {LevelModal} from './src/components/CafeDialogs';
import {BistroKitchenScreen} from './src/screens/BistroKitchenScreen';
import {LakeCastingScreen} from './src/screens/LakeCastingScreen';
import {CafeLandingScreen} from './src/screens/CafeLandingScreen';
import {WelcomeJourneyScreen} from './src/screens/WelcomeJourneyScreen';
import {SupplyMarketScreen} from './src/screens/SupplyMarketScreen';
import {BrandPreludeScreen} from './src/screens/BrandPreludeScreen';
import {CafePreferencesScreen} from './src/screens/CafePreferencesScreen';
import {CafeJournalScreen} from './src/screens/CafeJournalScreen';
import {loadProgress, saveProgress} from './src/storage/cafeJournal';
import type {
  CafeActivity,
  RootStackParamList,
} from './src/types/cafeRoutes';

enableScreens(true);

const CafeStack = createNativeStackNavigator<RootStackParamList>();
const cafeNavigation = createNavigationContainerRef<RootStackParamList>();

const HEARTS_PER_DAY = 5;
const HEART_PRICE = 10;
const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App(): React.JSX.Element {
  const [onboardingPage, setOnboardingPage] = useState(-1);
  const [cookingLevel, setCookingLevel] = useState(1);
  const [highestCookingLevel, setHighestCookingLevel] = useState(1);
  const [fishingLevel, setFishingLevel] = useState(1);
  const [highestFishingLevel, setHighestFishingLevel] = useState(1);
  const [cookingCoins, setCookingCoins] = useState(0);
  const [fishingCoins, setFishingCoins] = useState(0);
  const [purchasedShopItems, setPurchasedShopItems] = useState<string[]>([]);
  const [hearts, setHearts] = useState(5);
  const [lastHeartRefreshDate, setLastHeartRefreshDate] = useState(getLocalDate);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [homeGame, setHomeGame] = useState<CafeActivity>('bistro');
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const [levelModal, setLevelModal] = useState<CafeActivity | null>(null);
  const loaderProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(loaderProgress, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(loaderProgress, {
          toValue: 0,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    const timer = setTimeout(() => {
      if (cafeNavigation.isReady()) {
        cafeNavigation.navigate('Welcome');
      }
    }, 2600);
    return () => {
      clearTimeout(timer);
      animation.stop();
    };
  }, [loaderProgress]);

  useEffect(() => {
    loadProgress().then(saved => {
      if (saved) {
        setCookingLevel(Math.min(Math.max(saved.cookingLevel, 1), 11));
        setHighestCookingLevel(
          Math.min(Math.max(saved.highestCookingLevel, 1), 11),
        );
        setFishingLevel(Math.min(Math.max(saved.fishingLevel, 1), 11));
        setHighestFishingLevel(
          Math.min(Math.max(saved.highestFishingLevel, 1), 11),
        );
        setCookingCoins(Math.max(saved.cookingCoins, 0));
        setFishingCoins(Math.max(saved.fishingCoins, 0));
        setPurchasedShopItems(saved.purchasedShopItems ?? []);
        const today = getLocalDate();
        if (saved.lastHeartRefreshDate === today) {
          setHearts(Math.max(saved.hearts ?? HEARTS_PER_DAY, 0));
        } else {
          setHearts(HEARTS_PER_DAY);
        }
        setLastHeartRefreshDate(today);
      }
      setProgressLoaded(true);
    });
  }, []);

  useEffect(() => {
    const refreshDailyHearts = () => {
      const today = getLocalDate();
      if (today !== lastHeartRefreshDate) {
        setHearts(HEARTS_PER_DAY);
        setLastHeartRefreshDate(today);
      }
    };
    const subscription = AppState.addEventListener('change', state => {
      setAppState(state);
      if (state === 'active') {
        refreshDailyHearts();
      }
    });
    return () => subscription.remove();
  }, [lastHeartRefreshDate]);

  useEffect(() => {
    if (!progressLoaded) return;
    saveProgress({
      cookingLevel,
      highestCookingLevel,
      fishingLevel,
      highestFishingLevel,
      cookingCoins,
      fishingCoins,
      purchasedShopItems,
      hearts,
      lastHeartRefreshDate,
    });
  }, [
    cookingCoins,
    cookingLevel,
    fishingCoins,
    fishingLevel,
    highestCookingLevel,
    highestFishingLevel,
    hearts,
    lastHeartRefreshDate,
    progressLoaded,
    purchasedShopItems,
  ]);

  const startGame = () => {
    if (!levelModal) return;
    const game = levelModal;
    setLevelModal(null);
    cafeNavigation.navigate(game === 'angling' ? 'LakeTrip' : 'BistroShift');
  };
  const finishCookingLevel = () => {
    if (cookingLevel >= 11) {
      setHomeGame('bistro');
      cafeNavigation.navigate('CafeHub');
      return;
    }
    const nextLevel = Math.min(cookingLevel + 1, 11);
    setCookingLevel(nextLevel);
    setHighestCookingLevel(current => Math.max(current, nextLevel));
    setHearts(5);
    setHomeGame('bistro');
  };
  const finishFishingLevel = () => {
    if (fishingLevel >= 11) {
      setHomeGame('angling');
      cafeNavigation.navigate('CafeHub');
      return;
    }
    const nextLevel = Math.min(fishingLevel + 1, 11);
    setFishingLevel(nextLevel);
    setHighestFishingLevel(current => Math.max(current, nextLevel));
    setHomeGame('angling');
  };
  const restartAfterGameOver = () => {
    setCookingLevel(current => Math.max(1, current - 1));
    setHearts(5);
    setHomeGame('bistro');
    cafeNavigation.navigate('CafeHub');
  };
  const selectedLevel = levelModal === 'angling' ? fishingLevel : cookingLevel;
  const selectedHighestLevel =
    levelModal === 'angling' ? highestFishingLevel : highestCookingLevel;
  const selectLevel = (nextLevel: number) =>
    levelModal === 'angling'
      ? setFishingLevel(nextLevel)
      : setCookingLevel(nextLevel);
  const buyShopItem = (id: string, price: number) => {
    if (purchasedShopItems.includes(id) || cookingCoins < price) return false;
    setCookingCoins(current => current - price);
    setPurchasedShopItems(current => [...current, id]);
    return true;
  };
  const buyHeart = () => {
    if (cookingCoins < HEART_PRICE) return false;
    setCookingCoins(current => current - HEART_PRICE);
    setHearts(current => current + 1);
    return true;
  };
  const resetCookingProgress = () => {
    setCookingLevel(1);
    setHighestCookingLevel(1);
    setCookingCoins(0);
    setPurchasedShopItems([]);
    setHearts(5);
  };
  const resetFishingProgress = () => {
    setFishingLevel(1);
    setHighestFishingLevel(1);
    setFishingCoins(0);
  };
  return (
    <View style={styles.fill}>
      <NavigationContainer ref={cafeNavigation}>
        <CafeStack.Navigator
          initialRouteName="Prelude"
          screenOptions={{
            headerShown: false,
            animation: 'fade_from_bottom',
            gestureEnabled: false,
          }}>
          <CafeStack.Screen name="Prelude">
            {() => <BrandPreludeScreen progress={loaderProgress} />}
          </CafeStack.Screen>
          <CafeStack.Screen name="Welcome">
            {() => (
              <WelcomeJourneyScreen
                page={onboardingPage}
                sound={sound}
                onPage={setOnboardingPage}
                onDone={() => cafeNavigation.navigate('CafeHub')}
              />
            )}
          </CafeStack.Screen>
          <CafeStack.Screen name="CafeHub">
            {() => (
            <CafeLandingScreen
              cookingCoins={cookingCoins}
              fishingCoins={fishingCoins}
              hearts={hearts}
              initialGame={homeGame}
              onGame={setLevelModal}
              onShop={() => cafeNavigation.navigate('Supplies')}
              onJournal={() => cafeNavigation.navigate('Journal')}
              onSettings={() => cafeNavigation.navigate('Preferences')}
            />
            )}
          </CafeStack.Screen>
          <CafeStack.Screen name="Journal">
            {() => (
              <CafeJournalScreen
                bistroLevel={cookingLevel}
                highestBistroLevel={highestCookingLevel}
                lakeLevel={fishingLevel}
                highestLakeLevel={highestFishingLevel}
                bistroCredits={cookingCoins}
                lakeCredits={fishingCoins}
                hearts={hearts}
                purchasedItems={purchasedShopItems}
                onLake={() => {
                  setHomeGame('angling');
                  cafeNavigation.navigate('CafeHub');
                }}
                onSupplies={() => cafeNavigation.navigate('Supplies')}
                onBistro={() => {
                  setHomeGame('bistro');
                  cafeNavigation.navigate('CafeHub');
                }}
                onOptions={() => cafeNavigation.navigate('Preferences')}
              />
            )}
          </CafeStack.Screen>
          <CafeStack.Screen name="BistroShift">
            {() => (
            <BistroKitchenScreen
              key={`bistro-level-${cookingLevel}`}
              level={cookingLevel}
              coins={cookingCoins}
              hearts={hearts}
              onCoins={value => setCookingCoins(current => current + value)}
              onLoseHeart={() => setHearts(current => Math.max(0, current - 1))}
              onHome={() => {
                setHomeGame('bistro');
                cafeNavigation.navigate('CafeHub');
              }}
              onGameOver={restartAfterGameOver}
              onLevelComplete={finishCookingLevel}
              onSettings={() => cafeNavigation.navigate('Preferences')}
            />
            )}
          </CafeStack.Screen>
          <CafeStack.Screen name="LakeTrip">
            {() => (
            <LakeCastingScreen
              key={`lake-level-${fishingLevel}`}
              level={fishingLevel}
              coins={fishingCoins}
              onCoins={value => setFishingCoins(current => current + value)}
              onHome={() => {
                setHomeGame('angling');
                cafeNavigation.navigate('CafeHub');
              }}
              onLevelComplete={finishFishingLevel}
              onSettings={() => cafeNavigation.navigate('Preferences')}
            />
            )}
          </CafeStack.Screen>
          <CafeStack.Screen name="Supplies">
            {() => (
            <SupplyMarketScreen
              coins={cookingCoins}
              hearts={hearts}
              purchasedItems={purchasedShopItems}
              onBuy={buyShopItem}
              onBuyHeart={buyHeart}
              onHome={() => {
                setHomeGame('bistro');
                cafeNavigation.navigate('CafeHub');
              }}
              onFishing={() => {
                setHomeGame('angling');
                cafeNavigation.navigate('CafeHub');
              }}
              onSettings={() => cafeNavigation.navigate('Preferences')}
            />
            )}
          </CafeStack.Screen>
          <CafeStack.Screen name="Preferences">
            {() => (
            <CafePreferencesScreen
              sound={sound}
              music={music}
              onSound={setSound}
              onMusic={setMusic}
              onResetCooking={resetCookingProgress}
              onResetFishing={resetFishingProgress}
              onFishing={() => {
                setHomeGame('angling');
                cafeNavigation.navigate('CafeHub');
              }}
              onShop={() => cafeNavigation.navigate('Supplies')}
              onHome={() => {
                setHomeGame('bistro');
                cafeNavigation.navigate('CafeHub');
              }}
            />
            )}
          </CafeStack.Screen>
        </CafeStack.Navigator>
      </NavigationContainer>
      <LevelModal
        game={levelModal}
        level={selectedLevel}
        maxUnlockedLevel={selectedHighestLevel}
        onLevel={selectLevel}
        onClose={() => setLevelModal(null)}
        onPlay={startGame}
      />
      <Video
        source={cafeAudioVisuals.ambienceLoop}
        paused={!music || appState !== 'active'}
        repeat
        volume={0.18}
        disableFocus={Platform.OS === 'android'}
        ignoreSilentSwitch="ignore"
        playInBackground={false}
        playWhenInactive={false}
        style={styles.cafeAudioVisuals}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  cafeAudioVisuals: {width: 1, height: 1, position: 'absolute'},
});
