import React, {useState} from 'react';
import {
  ImageBackground,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {scenery} from '../assets';
import {cafePalette} from '../theme/cafePalette';

type CafePreferencesScreenProps = {
  sound: boolean;
  music: boolean;
  onSound: (value: boolean) => void;
  onMusic: (value: boolean) => void;
  onResetCooking: () => void;
  onResetFishing: () => void;
  onFishing: () => void;
  onShop: () => void;
  onHome: () => void;
};

export function CafePreferencesScreen({
  sound,
  music,
  onSound,
  onMusic,
  onResetCooking,
  onResetFishing,
  onFishing,
  onShop,
  onHome,
}: CafePreferencesScreenProps) {
  const {height} = useWindowDimensions();
  const compact = height < 720;
  const [message, setMessage] = useState('');

  return (
    <ImageBackground
      source={scenery.preferences}
      style={styles.fill}
      resizeMode="cover">
      <StatusBar hidden />
      <SafeAreaView
        style={[
          styles.fill,
          Platform.OS === 'android' && styles.contentAndroid,
        ]}>
        <View style={[styles.card, compact && styles.cardCompact]}>
          <Text style={styles.title}>Toni’s Ice Cafe</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Sound</Text>
            <Switch
              value={sound}
              onValueChange={onSound}
              trackColor={{false: '#7c9aad', true: cafePalette.darkBlue}}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Music</Text>
            <Switch
              value={music}
              onValueChange={onMusic}
              trackColor={{false: '#7c9aad', true: cafePalette.darkBlue}}
            />
          </View>

          <Text style={styles.progressTitle}>Reset progress</Text>

          <Pressable
            style={styles.resetButton}
            onPress={() => {
              onResetCooking();
              setMessage('Café progress has been reset');
            }}>
            <Text style={styles.resetButtonText}>Reset Café</Text>
          </Pressable>

          <Pressable
            style={styles.resetButton}
            onPress={() => {
              onResetFishing();
              setMessage('Fishing progress has been reset');
            }}>
            <Text style={styles.resetButtonText}>Reset Fishing</Text>
          </Pressable>

          {!!message && <Text style={styles.message}>{message}</Text>}
        </View>

        <View style={[styles.nav, compact && styles.navCompact]}>
          <Nav icon="🎣" label="Lake" onPress={onFishing} />
          <Nav icon="🚚" label="Supplies" onPress={onShop} />
          <Nav icon="🐟" label="Bistro" onPress={onHome} />
          <Nav icon="📖" label="Options" active onPress={() => {}} />
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
      style={[styles.navItem, active && styles.activeTab]}
      onPress={onPress}>
      <Text style={styles.emoji}>{icon}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  contentAndroid: {paddingTop: 15},
  card: {
    width: '88%',
    maxWidth: 390,
    alignSelf: 'center',
    marginTop: '24%',
    backgroundColor: 'rgba(95, 188, 237, 0.96)',
    borderWidth: 7,
    borderColor: cafePalette.outline,
    borderRadius: 42,
    padding: 24,
  },
  cardCompact: {marginTop: 56, padding: 16, borderRadius: 30, borderWidth: 5},
  title: {
    fontFamily: 'Georgia',
    color: cafePalette.white,
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 13,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 7,
  },
  settingLabel: {
    fontFamily: 'Georgia',
    color: cafePalette.white,
    fontSize: 25,
    fontWeight: '900',
  },
  progressTitle: {
    color: cafePalette.white,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  resetButton: {
    backgroundColor: cafePalette.darkBlue,
    borderWidth: 3,
    borderColor: cafePalette.outline,
    borderRadius: 15,
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 8,
  },
  resetButtonText: {color: cafePalette.white, fontSize: 16, fontWeight: '900'},
  message: {
    color: '#fff16c',
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
  },
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
  activeTab: {
    backgroundColor: cafePalette.blue,
    borderWidth: 3,
    borderColor: cafePalette.outline,
  },
  emoji: {fontSize: 29},
});
