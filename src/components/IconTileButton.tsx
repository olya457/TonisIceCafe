import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import {cafePalette} from '../theme/cafePalette';

export function IconTileButton({icon, onPress}: {icon: string; onPress: () => void}) {
  return <Pressable onPress={onPress} style={styles.button}><Text style={styles.icon}>{icon}</Text></Pressable>;
}

const styles = StyleSheet.create({
  button: {width: 50, height: 50, borderRadius: 14, borderWidth: 4, borderColor: cafePalette.outline, backgroundColor: cafePalette.blue, justifyContent: 'center', alignItems: 'center'},
  icon: {color: cafePalette.white, fontSize: 26, fontWeight: '900'},
});
