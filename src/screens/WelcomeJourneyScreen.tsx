import React from 'react';
import {Dimensions, Image, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import Video from 'react-native-video';
import {scenery, cafeAudioVisuals} from '../assets';
import {WELCOME_STORIES} from '../data/welcomeStories';
import {cafePalette} from '../theme/cafePalette';
import {FrostActionButton} from '../components/FrostActionButton';

export function WelcomeJourneyScreen({page, sound, onPage, onDone}: {page: number; sound: boolean; onPage: (page: number) => void; onDone: () => void}) {
  const {height} = useWindowDimensions();
  const compact = height < 720;
  if (page < 0) return <View style={styles.videoScreen}><StatusBar hidden /><Video source={cafeAudioVisuals.welcomeFilm} style={styles.background} resizeMode="cover" repeat={false} muted={!sound} onEnd={() => onPage(0)} /><Pressable onPress={() => onPage(0)} style={styles.skip}><Text style={styles.skipText}>Skip</Text></Pressable></View>;
  const item = WELCOME_STORIES[page];
  return <View style={styles.fill}><StatusBar hidden /><Image source={scenery.welcome} style={styles.background} resizeMode="cover" /><SafeAreaView style={[styles.content, compact && styles.contentCompact]}><View style={[styles.card, compact && styles.cardCompact]}><Text style={styles.title}>{item.title}</Text><Text style={styles.body}>{item.text}</Text></View><View style={[styles.dots, compact && styles.dotsCompact]}>{WELCOME_STORIES.map((_, i) => <View key={i} style={[styles.dot, i === page && styles.activeDot]} />)}</View><FrostActionButton title={page === 2 ? 'Play' : 'Next'} onPress={() => page === 2 ? onDone() : onPage(page + 1)} /></SafeAreaView></View>;
}

const width = Dimensions.get('window').width;
const styles = StyleSheet.create({
  fill: {flex: 1, backgroundColor: '#087fdc'}, videoScreen: {flex: 1, backgroundColor: '#000'}, background: {position: 'absolute', width: '100%', height: '100%'}, skip: {position: 'absolute', right: 24, top: 54, backgroundColor: 'rgba(0,0,0,.4)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20}, skipText: {color: cafePalette.white, fontWeight: '800'},
  content: {flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 38}, card: {width: '100%', backgroundColor: cafePalette.blue, borderWidth: 5, borderColor: cafePalette.outline, borderRadius: 16, padding: 16, minHeight: 180}, title: {fontFamily: 'Georgia', fontWeight: '900', fontSize: Math.min(26, width * 0.065), textAlign: 'center', color: cafePalette.darkBlue, marginBottom: 8}, body: {fontFamily: 'Georgia', fontWeight: '700', fontSize: Math.min(16, width * 0.042), lineHeight: 20, color: cafePalette.white}, dots: {flexDirection: 'row', gap: 8, marginVertical: 12}, dot: {width: 9, height: 9, borderRadius: 5, backgroundColor: '#c7eaff'}, activeDot: {width: 25, backgroundColor: cafePalette.darkBlue},
  contentCompact: {paddingBottom: 10}, cardCompact: {minHeight: 145, padding: 12}, dotsCompact: {marginVertical: 7},
});
