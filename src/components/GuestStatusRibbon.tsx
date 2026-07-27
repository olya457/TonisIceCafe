import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {cafePalette} from '../theme/cafePalette';
import {IconTileButton} from './IconTileButton';

export function CreditBadge({coins}: {coins: number}) {
  return <View style={styles.stat}><Text style={styles.coin}>●</Text><Text style={styles.value}>{coins}</Text></View>;
}

export function GuestStatusRibbon({hearts, coins, onSettings, showSettings = false, showHearts = true}: {hearts: number; coins: number; onSettings: () => void; showSettings?: boolean; showHearts?: boolean}) {
  return <View style={styles.bar}>
    {showHearts && <View style={styles.stat}><Text style={styles.heart}>♥</Text><Text style={styles.value}>{hearts}</Text></View>}
    <CreditBadge coins={coins} />
    {showSettings && <IconTileButton icon="⚙" onPress={onSettings} />}
  </View>;
}

const styles = StyleSheet.create({
  bar: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingTop: 8},
  stat: {height: 34, minWidth: 72, paddingHorizontal: 8, backgroundColor: cafePalette.darkBlue, borderWidth: 3, borderColor: cafePalette.outline, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 7},
  heart: {fontSize: 23, color: '#ff3dab', lineHeight: 27},
  coin: {fontSize: 30, color: cafePalette.yellow, lineHeight: 31},
  value: {color: cafePalette.white, fontWeight: '900', fontSize: 16},
});
