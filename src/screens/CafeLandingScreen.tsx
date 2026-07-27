import React, {useState} from 'react';
import {
  ImageBackground,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {scenery} from '../assets';
import {FrostActionButton} from '../components/FrostActionButton';
import {GuestStatusRibbon} from '../components/GuestStatusRibbon';
import {cafePalette} from '../theme/cafePalette';
import type {CafeActivity} from '../types/cafeRoutes';

type HomeTab = 'angling' | 'journal' | 'shop' | 'home' | 'menu';

type CafeLandingScreenProps = {
  cookingCoins: number;
  fishingCoins: number;
  hearts: number;
  initialGame: CafeActivity;
  onSettings: () => void;
  onJournal: () => void;
  onGame: (game: CafeActivity) => void;
  onShop: () => void;
};

export function CafeLandingScreen({
  cookingCoins,
  fishingCoins,
  hearts,
  initialGame,
  onSettings,
  onJournal,
  onGame,
  onShop,
}: CafeLandingScreenProps) {
  const {height} = useWindowDimensions();
  const compact = height < 720;
  const [game, setGame] = useState<CafeActivity>(initialGame);
  const [activeTab, setActiveTab] = useState<HomeTab>(
    initialGame === 'angling' ? 'angling' : 'home',
  );

  const selectGame = (selectedGame: CafeActivity, tab: HomeTab) => {
    setGame(selectedGame);
    setActiveTab(tab);
  };

  return (
    <ImageBackground
      source={
        game === 'bistro' ? scenery.cafeMap : scenery.pierMap
      }
      style={styles.fill}
      resizeMode="cover">
      <StatusBar hidden />
      <SafeAreaView
        style={[
          styles.content,
          Platform.OS === 'android' && styles.contentAndroid,
        ]}>
        <GuestStatusRibbon
          hearts={hearts}
          coins={game === 'bistro' ? cookingCoins : fishingCoins}
          showHearts={game === 'bistro'}
          onSettings={onSettings}
        />
        <View style={[styles.launchArea, compact && styles.launchAreaCompact]}>
          <FrostActionButton
            title={game === 'bistro' ? 'Start Shift' : 'Cast Off'}
            onPress={() => onGame(game)}
          />
        </View>
        <View style={[styles.nav, compact && styles.navCompact]}>
          <Nav
            icon="🎣"
            label="Lake"
            active={activeTab === 'angling'}
            onPress={() => selectGame('angling', 'angling')}
          />
          <Nav icon="🚚" label="Supplies" onPress={onShop} />
          <Nav icon="📔" label="Journal" onPress={onJournal} />
          <Nav
            icon="🐟"
            label="Bistro"
            active={activeTab === 'home'}
            onPress={() => selectGame('bistro', 'home')}
          />
          <Nav icon="⚙" label="Options" onPress={onSettings} />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function Nav({
  icon,
  label,
  onPress,
  active = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      style={[styles.navItem, active && styles.active]}
      onPress={onPress}>
      <Text style={styles.emoji}>{icon}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  content: {flex: 1, alignItems: 'center'},
  contentAndroid: {paddingTop: 15},
  launchArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 142,
    alignItems: 'center',
    zIndex: 2,
  },
  launchAreaCompact: {bottom: 105},
  nav: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 30,
    height: 86,
    backgroundColor: cafePalette.darkBlue,
    borderRadius: 18,
    flexDirection: 'row',
    padding: 4,
  },
  navCompact: {bottom: 8, height: 76},
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  active: {
    backgroundColor: cafePalette.blue,
    borderWidth: 3,
    borderColor: cafePalette.outline,
  },
  emoji: {fontSize: 29},
});
