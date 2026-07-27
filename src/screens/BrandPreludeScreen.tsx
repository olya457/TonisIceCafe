import React from 'react';
import {Animated, Image, SafeAreaView, StatusBar, StyleSheet, View} from 'react-native';
import {scenery} from '../assets';

export function BrandPreludeScreen({progress}: {progress: Animated.Value}) {
  return <View style={styles.fill}><StatusBar hidden /><Image source={scenery.arrival} style={styles.background} resizeMode="cover" /><SafeAreaView style={styles.content}><View /><View style={styles.track}><Animated.View style={[styles.pill, {transform: [{translateX: progress.interpolate({inputRange: [0, 1], outputRange: [0, 214]})}]}]} /></View></SafeAreaView></View>;
}

const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: '#087fdc'}, background: {position: 'absolute', width: '100%', height: '100%'}, content: {flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingTop: '9%', paddingBottom: '9%'}, track: {height: 19, width: '72%', maxWidth: 270, borderRadius: 12, backgroundColor: 'rgba(255,255,255,.9)', padding: 3, overflow: 'hidden'}, pill: {height: 13, width: 50, borderRadius: 9, backgroundColor: '#35baf4'},
});
