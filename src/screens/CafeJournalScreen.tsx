import React, {useMemo, useState} from 'react';
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {lakeArt, pantryArt, scenery} from '../assets';
import {SERVICE_MILESTONES} from '../data/serviceMilestones';
import {cafePalette} from '../theme/cafePalette';

type JournalSection = 'overview' | 'recipes' | 'lake';

type CafeJournalScreenProps = {
  bistroLevel: number;
  highestBistroLevel: number;
  lakeLevel: number;
  highestLakeLevel: number;
  bistroCredits: number;
  lakeCredits: number;
  hearts: number;
  purchasedItems: string[];
  onLake: () => void;
  onSupplies: () => void;
  onBistro: () => void;
  onOptions: () => void;
};

const recipeEntries = [
  {name: 'Herb Lake Fillet', art: pantryArt.herbFillet, unlockAt: 1},
  {name: 'Toni’s Tea Special', art: pantryArt.chefSpecial, unlockAt: 3},
  {name: 'Citrus Winter Plate', art: pantryArt.chefSpecial, unlockAt: 6},
] as const;

const swimmerNames = [
  'Glacier Swimmer',
  'Coral Dart',
  'Sunset Minnow',
  'Berry Fin',
  'Bluefin Prize',
  'Redfin Prize',
  'Golden Lake Star',
] as const;

export function CafeJournalScreen({
  bistroLevel,
  highestBistroLevel,
  lakeLevel,
  highestLakeLevel,
  bistroCredits,
  lakeCredits,
  hearts,
  purchasedItems,
  onLake,
  onSupplies,
  onBistro,
  onOptions,
}: CafeJournalScreenProps) {
  const [section, setSection] = useState<JournalSection>('overview');
  const unlockedFish = Math.min(
    lakeArt.swimmers.length,
    Math.max(1, Math.ceil(highestLakeLevel / 2)),
  );
  const unlockedRecipes = recipeEntries.filter(
    entry => entry.unlockAt <= highestBistroLevel,
  ).length;
  const reputation = Math.min(
    100,
    Math.round(
      ((highestBistroLevel + highestLakeLevel - 2) /
        ((SERVICE_MILESTONES.length - 1) * 2)) *
        100,
    ),
  );
  const nextBistroGoal =
    SERVICE_MILESTONES[Math.min(bistroLevel - 1, SERVICE_MILESTONES.length - 1)];
  const nextLakeGoal =
    SERVICE_MILESTONES[Math.min(lakeLevel - 1, SERVICE_MILESTONES.length - 1)];
  const totalCredits = bistroCredits + lakeCredits;

  const journalNote = useMemo(() => {
    if (reputation >= 100) {
      return 'Every page is complete. Toni’s cafe is a northern landmark!';
    }
    if (highestLakeLevel < highestBistroLevel) {
      return 'The pantry is busy. A lake trip will help balance the journal.';
    }
    return 'The lake collection is growing. Complete a bistro shift next.';
  }, [highestBistroLevel, highestLakeLevel, reputation]);

  return (
    <ImageBackground
      source={scenery.preferences}
      style={styles.fill}
      resizeMode="cover">
      <SafeAreaView
        style={[
          styles.safeArea,
          Platform.OS === 'android' && styles.safeAreaAndroid,
        ]}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <View style={styles.headingCopy}>
            <Text style={styles.eyebrow}>TONI’S ICE CAFE</Text>
            <Text style={styles.title}>Cafe Journal</Text>
          </View>
          <View style={styles.levelSeal}>
            <Text style={styles.levelSealText}>{reputation}%</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          <JournalTab
            label="Summary"
            active={section === 'overview'}
            onPress={() => setSection('overview')}
          />
          <JournalTab
            label="Recipes"
            active={section === 'recipes'}
            onPress={() => setSection('recipes')}
          />
          <JournalTab
            label="Lake Book"
            active={section === 'lake'}
            onPress={() => setSection('lake')}
          />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {section === 'overview' && (
            <>
              <View style={styles.noteCard}>
                <Text style={styles.noteIcon}>✦</Text>
                <View style={styles.noteCopy}>
                  <Text style={styles.cardTitle}>Toni’s note</Text>
                  <Text style={styles.bodyText}>{journalNote}</Text>
                </View>
              </View>

              <View style={styles.statGrid}>
                <StatCard label="Bistro" value={`Lv ${highestBistroLevel}`} icon="♨" />
                <StatCard label="Lake" value={`Lv ${highestLakeLevel}`} icon="🎣" />
                <StatCard label="Credits" value={`${totalCredits}`} icon="●" />
                <StatCard label="Hearts" value={`${hearts}`} icon="♥" />
              </View>

              <View style={styles.progressCard}>
                <Text style={styles.cardTitle}>Next journal entries</Text>
                <GoalRow
                  icon="🍽"
                  title={`Bistro milestone ${bistroLevel}`}
                  detail={`Serve ${nextBistroGoal[0]} guests · earn ${nextBistroGoal[1]} credits`}
                />
                <GoalRow
                  icon="🐟"
                  title={`Lake milestone ${lakeLevel}`}
                  detail={`Catch ${nextLakeGoal[0]} fish · earn ${nextLakeGoal[1]} credits`}
                />
              </View>

              <View style={styles.collectionSummary}>
                <Text style={styles.cardTitle}>Collections</Text>
                <Text style={styles.bodyText}>
                  {unlockedRecipes}/{recipeEntries.length} recipes discovered
                </Text>
                <Text style={styles.bodyText}>
                  {unlockedFish}/{lakeArt.swimmers.length} lake species recorded
                </Text>
                <Text style={styles.bodyText}>
                  {purchasedItems.length} supply upgrades owned
                </Text>
              </View>
            </>
          )}

          {section === 'recipes' && (
            <>
              <Text style={styles.sectionIntro}>
                Complete bistro milestones to reveal Toni’s handwritten recipes.
              </Text>
              {recipeEntries.map(entry => {
                const unlocked = entry.unlockAt <= highestBistroLevel;
                return (
                  <View
                    key={entry.name}
                    style={[styles.entryCard, !unlocked && styles.lockedCard]}>
                    <View style={styles.artCircle}>
                      {unlocked ? (
                        <Image
                          source={entry.art}
                          style={styles.entryArt}
                          resizeMode="contain"
                        />
                      ) : (
                        <Text style={styles.lockIcon}>🔒</Text>
                      )}
                    </View>
                    <View style={styles.entryCopy}>
                      <Text style={styles.entryTitle}>
                        {unlocked ? entry.name : 'Undiscovered recipe'}
                      </Text>
                      <Text style={styles.entryDetail}>
                        {unlocked
                          ? 'Recorded in Toni’s winter menu'
                          : `Reach bistro milestone ${entry.unlockAt}`}
                      </Text>
                    </View>
                    <Text style={styles.entryStatus}>
                      {unlocked ? '✓' : entry.unlockAt}
                    </Text>
                  </View>
                );
              })}
            </>
          )}

          {section === 'lake' && (
            <>
              <Text style={styles.sectionIntro}>
                New species appear as the frozen-lake route advances.
              </Text>
              <View style={styles.fishGrid}>
                {lakeArt.swimmers.map((source, index) => {
                  const unlocked = index < unlockedFish;
                  return (
                    <View
                      key={swimmerNames[index]}
                      style={[styles.fishCard, !unlocked && styles.lockedCard]}>
                      <View style={styles.fishArtBox}>
                        {unlocked ? (
                          <Image
                            source={source}
                            style={styles.fishArt}
                            resizeMode="contain"
                          />
                        ) : (
                          <Text style={styles.fishShadow}>?</Text>
                        )}
                      </View>
                      <Text style={styles.fishName}>
                        {unlocked ? swimmerNames[index] : 'Unknown catch'}
                      </Text>
                      <Text style={styles.fishIndex}>
                        #{String(index + 1).padStart(2, '0')}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
        <View style={styles.navigationDock}>
          <JournalNav icon="🎣" label="Lake" onPress={onLake} />
          <JournalNav icon="🚚" label="Supplies" onPress={onSupplies} />
          <JournalNav icon="📔" label="Journal" active onPress={() => {}} />
          <JournalNav icon="🐟" label="Bistro" onPress={onBistro} />
          <JournalNav icon="⚙" label="Options" onPress={onOptions} />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function JournalTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, active && styles.activeTab]}>
      <Text style={[styles.tabText, active && styles.activeTabText]}>
        {label}
      </Text>
    </Pressable>
  );
}

function JournalNav({
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
      onPress={onPress}
      style={[styles.navigationItem, active && styles.activeNavigationItem]}>
      <Text style={styles.navigationIcon}>{icon}</Text>
    </Pressable>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function GoalRow({
  icon,
  title,
  detail,
}: {
  icon: string;
  title: string;
  detail: string;
}) {
  return (
    <View style={styles.goalRow}>
      <Text style={styles.goalIcon}>{icon}</Text>
      <View style={styles.goalCopy}>
        <Text style={styles.goalTitle}>{title}</Text>
        <Text style={styles.goalDetail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  safeArea: {flex: 1, backgroundColor: 'rgba(0,40,90,.34)'},
  safeAreaAndroid: {paddingTop: 15},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 5,
    paddingBottom: 10,
  },
  headerSpacer: {width: 50, height: 50},
  headingCopy: {flex: 1, alignItems: 'center'},
  eyebrow: {
    color: '#fff16c',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  title: {
    color: cafePalette.white,
    fontFamily: 'Georgia',
    fontSize: 28,
    fontWeight: '900',
  },
  levelSeal: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: cafePalette.darkBlue,
    borderWidth: 4,
    borderColor: cafePalette.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelSealText: {color: cafePalette.white, fontWeight: '900', fontSize: 12},
  tabs: {
    marginHorizontal: 12,
    flexDirection: 'row',
    borderRadius: 18,
    backgroundColor: cafePalette.darkBlue,
    padding: 4,
  },
  tab: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: cafePalette.blue,
    borderWidth: 2,
    borderColor: cafePalette.outline,
  },
  tabText: {color: '#c7eaff', fontWeight: '800', fontSize: 12},
  activeTabText: {color: cafePalette.white},
  scrollContent: {padding: 12, paddingBottom: 125, gap: 12},
  navigationDock: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 30,
    height: 86,
    flexDirection: 'row',
    padding: 4,
    borderRadius: 18,
    backgroundColor: cafePalette.darkBlue,
  },
  navigationItem: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeNavigationItem: {
    backgroundColor: cafePalette.blue,
    borderWidth: 3,
    borderColor: cafePalette.outline,
  },
  navigationIcon: {fontSize: 25},
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 4,
    borderColor: cafePalette.outline,
    backgroundColor: 'rgba(97,189,241,.96)',
    padding: 16,
  },
  noteIcon: {fontSize: 34, color: '#fff16c', marginRight: 14},
  noteCopy: {flex: 1},
  cardTitle: {
    color: cafePalette.white,
    fontFamily: 'Georgia',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 5,
  },
  bodyText: {color: cafePalette.white, fontWeight: '700', lineHeight: 19},
  statGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  statCard: {
    width: '48.5%',
    minHeight: 96,
    borderRadius: 20,
    backgroundColor: cafePalette.darkBlue,
    borderWidth: 3,
    borderColor: cafePalette.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {position: 'absolute', left: 12, top: 10, fontSize: 18, color: '#fff16c'},
  statValue: {color: cafePalette.white, fontSize: 23, fontWeight: '900'},
  statLabel: {color: '#c7eaff', fontWeight: '800', marginTop: 2},
  progressCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(47,126,255,.94)',
    borderWidth: 4,
    borderColor: cafePalette.outline,
    padding: 15,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(97,189,241,.55)',
    borderRadius: 15,
    padding: 11,
    marginTop: 9,
  },
  goalIcon: {fontSize: 25, marginRight: 10},
  goalCopy: {flex: 1},
  goalTitle: {color: cafePalette.white, fontWeight: '900'},
  goalDetail: {color: '#e6f6ff', fontWeight: '700', fontSize: 12, marginTop: 2},
  collectionSummary: {
    borderRadius: 22,
    backgroundColor: 'rgba(97,189,241,.96)',
    borderWidth: 4,
    borderColor: cafePalette.outline,
    padding: 16,
    gap: 5,
  },
  sectionIntro: {
    color: cafePalette.white,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: 15,
    lineHeight: 19,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 102,
    borderRadius: 20,
    backgroundColor: cafePalette.darkBlue,
    borderWidth: 3,
    borderColor: cafePalette.outline,
    padding: 10,
  },
  lockedCard: {opacity: 0.68},
  artCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: cafePalette.blue,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 7,
  },
  entryArt: {width: '100%', height: '100%'},
  lockIcon: {fontSize: 28},
  entryCopy: {flex: 1, paddingHorizontal: 12},
  entryTitle: {color: cafePalette.white, fontSize: 16, fontWeight: '900'},
  entryDetail: {color: '#c7eaff', marginTop: 5, fontSize: 12, fontWeight: '700'},
  entryStatus: {color: '#fff16c', fontSize: 22, fontWeight: '900', marginRight: 8},
  fishGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  fishCard: {
    width: '48.5%',
    minHeight: 165,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: cafePalette.outline,
    backgroundColor: cafePalette.darkBlue,
    padding: 9,
    alignItems: 'center',
  },
  fishArtBox: {
    width: '100%',
    height: 100,
    borderRadius: 15,
    backgroundColor: cafePalette.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fishArt: {width: '92%', height: '92%'},
  fishShadow: {fontSize: 46, color: '#c7eaff', fontWeight: '900'},
  fishName: {
    color: cafePalette.white,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
  },
  fishIndex: {color: '#fff16c', fontWeight: '800', fontSize: 11, marginTop: 3},
});
