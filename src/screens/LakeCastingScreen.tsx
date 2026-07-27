import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
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

import {scenery, lakeArt} from '../assets';
import {CompleteModal, PauseModal} from '../components/CafeDialogs';
import {IconTileButton} from '../components/IconTileButton';
import {CreditBadge} from '../components/GuestStatusRibbon';
import {SERVICE_MILESTONES} from '../data/serviceMilestones';
import {cafePalette} from '../theme/cafePalette';

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const bubbleConfig = [
  {left: '8%', size: 9, delay: 0, duration: 5200},
  {left: '20%', size: 14, delay: 900, duration: 6200},
  {left: '34%', size: 7, delay: 1800, duration: 4800},
  {left: '48%', size: 12, delay: 2700, duration: 5900},
  {left: '61%', size: 8, delay: 3500, duration: 5000},
  {left: '73%', size: 16, delay: 4300, duration: 6800},
  {left: '84%', size: 10, delay: 5100, duration: 5500},
  {left: '92%', size: 6, delay: 6000, duration: 4600},
] as const;

const HOOK_DROP_DISTANCE = 255;
const HOOK_START_TOP = 110;
const LINE_HEIGHT = 190;
const FISH_SPAWN_INTERVAL = 3000;
const BASE_SWIM_DURATION = 5400;
const FISH_ORDER = [0, 3, 6, 2, 5, 1, 4] as const;
const FISH_LANES = [
  HOOK_START_TOP + LINE_HEIGHT + HOOK_DROP_DISTANCE - 82,
  HOOK_START_TOP + LINE_HEIGHT + HOOK_DROP_DISTANCE - 17,
  HOOK_START_TOP + LINE_HEIGHT + HOOK_DROP_DISTANCE + 48,
] as const;

const HORIZONTAL_CATCH_DISTANCE = 75;
const VERTICAL_CATCH_DISTANCE = 80;

type LakeCastingScreenProps = {
  level: number;
  coins: number;
  onCoins: (amount: number) => void;
  onHome: () => void;
  onLevelComplete: () => void;
  onSettings: () => void;
};

type FishPosition = {
  x: number;
  y: number;
};

type ActiveFish = {
  id: number;
  sourceIndex: number;
  top: number;
  direction: 'left' | 'right';
};

export function LakeCastingScreen({
  level,
  coins,
  onCoins,
  onHome,
  onLevelComplete,
  onSettings,
}: LakeCastingScreenProps) {
  const {height} = useWindowDimensions();
  const compact = height < 720;
  const target = SERVICE_MILESTONES[level - 1][0];
  const fishSpeedMultiplier = Math.min(1.8, 1 + (level - 1) * 0.08);

  const [gear, setGear] = useState([0, 0, 0]);
  const [caught, setCaught] = useState(0);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const [activeFish, setActiveFish] = useState<ActiveFish[]>([]);
  const [caughtFishId, setCaughtFishId] = useState<number | null>(null);
  const [hook, setHook] = useState({x: 0, y: 0});
  const [casting, setCasting] = useState(false);
  const [caughtFishSource, setCaughtFishSource] = useState<number | null>(null);

  const fishCoordinates = useRef<Record<number, FishPosition>>({});
  const nextFishRef = useRef(0);
  const nextFishIdRef = useRef(0);

  const hookDrop = useRef(new Animated.Value(0)).current;
  const plusOpacity = useRef(new Animated.Value(0)).current;
  const missOpacity = useRef(new Animated.Value(0)).current;

  const ready = gear.every(value => value >= 3);

  const registerFishPosition = useCallback(
    (index: number, position: FishPosition) => {
      fishCoordinates.current[index] = position;
    },
    [],
  );

  const removeFish = useCallback((id: number) => {
    delete fishCoordinates.current[id];
    setActiveFish(current => current.filter(item => item.id !== id));
  }, []);

  const getHookPosition = (): FishPosition => {
    return {
      x: screenWidth * 0.48 + hook.x + 23,
      y: HOOK_START_TOP + LINE_HEIGHT + HOOK_DROP_DISTANCE + hook.y + 25,
    };
  };

  const findCaughtFish = (): number | null => {
    const hookPosition = getHookPosition();

    let closestFish: {
      index: number;
      distance: number;
    } | null = null;

    for (const [fishIndex, fishPosition] of Object.entries(
      fishCoordinates.current,
    )) {
      const index = Number(fishIndex);

      const horizontalDistance = Math.abs(fishPosition.x - hookPosition.x);

      const verticalDistance = Math.abs(fishPosition.y - hookPosition.y);

      const canCatch =
        horizontalDistance <= HORIZONTAL_CATCH_DISTANCE &&
        verticalDistance <= VERTICAL_CATCH_DISTANCE;

      if (!canCatch) {
        continue;
      }

      const totalDistance = horizontalDistance + verticalDistance;

      if (closestFish === null || totalDistance < closestFish.distance) {
        closestFish = {
          index,
          distance: totalDistance,
        };
      }
    }

    return closestFish === null ? null : closestFish.index;
  };

  const finishCatch = (fishId: number) => {
    const fish = activeFish.find(item => item.id === fishId);

    if (!fish) {
      return;
    }

    const source = lakeArt.swimmers[fish.sourceIndex];

    setCaughtFishId(fishId);
    setCaughtFishSource(source);

    const nextCaught = caught + 1;

    setCaught(nextCaught);
    onCoins(10);

    plusOpacity.setValue(1);

    if (nextCaught >= target) {
      setComplete(true);
    }
  };

  const showMiss = () => {
    missOpacity.setValue(1);

    Animated.sequence([
      Animated.delay(250),
      Animated.timing(missOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const retractHook = (caughtId: number | null) => {
    Animated.parallel([
      Animated.timing(hookDrop, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),

      Animated.sequence([
        Animated.delay(300),
        Animated.timing(plusOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setCaughtFishSource(null);
      setCasting(false);

      if (caughtId !== null) {
        delete fishCoordinates.current[caughtId];
        setActiveFish(fish => fish.filter(item => item.id !== caughtId));
        setCaughtFishId(null);
      }
    });
  };

  const castHook = () => {
    if (casting || paused || complete) {
      return;
    }

    setCasting(true);
    setCaughtFishSource(null);

    plusOpacity.setValue(0);
    missOpacity.setValue(0);
    hookDrop.setValue(0);

    Animated.timing(hookDrop, {
      toValue: 1,
      duration: 650,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(({finished}) => {
      if (!finished) {
        setCasting(false);
        return;
      }

      const fishIndex = findCaughtFish();

      if (fishIndex !== null) {
        finishCatch(fishIndex);
      } else {
        showMiss();
      }

      retractHook(fishIndex);
    });
  };

  const moveHook = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (casting || paused || complete) {
      return;
    }

    setHook(current => {
      switch (direction) {
        case 'up':
          return {
            ...current,
            y: Math.max(-100, current.y - 30),
          };

        case 'down':
          return {
            ...current,
            y: Math.min(100, current.y + 30),
          };

        case 'left':
          return {
            ...current,
            x: Math.max(-140, current.x - 30),
          };

        case 'right':
          return {
            ...current,
            x: Math.min(140, current.x + 30),
          };

        default:
          return current;
      }
    });
  };

  const leaveTrip = () => {
    setPaused(false);
    setComplete(false);
    setTimeout(onHome, 0);
  };

  const continueAfterResult = () => {
    setComplete(false);
    setTimeout(onLevelComplete, 0);
  };

  useEffect(() => {
    if (!paused) {
      return;
    }

    hookDrop.stopAnimation();
    plusOpacity.stopAnimation();
    missOpacity.stopAnimation();

    hookDrop.setValue(0);
    plusOpacity.setValue(0);
    missOpacity.setValue(0);

    setCaughtFishSource(null);
    setCasting(false);
    setCaughtFishId(current => {
      if (current !== null) {
        delete fishCoordinates.current[current];
        setActiveFish(fish => fish.filter(item => item.id !== current));
      }

      return null;
    });
  }, [hookDrop, missOpacity, paused, plusOpacity]);

  useEffect(() => {
    if (!ready || paused || complete) {
      return;
    }

    const spawnFish = () => {
      setActiveFish(current => {
        if (current.length >= 2) {
          return current;
        }

        const sourceIndex = FISH_ORDER[nextFishRef.current % FISH_ORDER.length];
        nextFishRef.current += 1;
        nextFishIdRef.current += 1;

        const id = nextFishIdRef.current;

        return [
          ...current,
          {
            id,
            sourceIndex,
            top: FISH_LANES[(id - 1) % FISH_LANES.length],
            direction: sourceIndex === 0 ? 'right' : 'left',
          },
        ];
      });
    };

    spawnFish();
    const timer = setInterval(spawnFish, FISH_SPAWN_INTERVAL);

    return () => clearInterval(timer);
  }, [complete, paused, ready]);

  if (!ready) {
    return (
      <ImageBackground
        source={scenery.pierMap}
        style={styles.fill}
        resizeMode="cover">
        <StatusBar hidden />

        <SafeAreaView style={styles.fill}>
          <View style={[styles.top, compact && styles.topCompact]}>
            <CreditBadge coins={coins} />

            <IconTileButton icon="Ⅱ" onPress={() => setPaused(true)} />
          </View>

          <View style={[styles.gearArea, compact && styles.gearAreaCompact]}>
            <View style={[styles.gearRow, compact && styles.gearRowCompact]}>
              {lakeArt.equipment.map((source, index) => (
                <Pressable
                  key={index}
                  onPress={() =>
                    setGear(values =>
                      values.map((value, itemIndex) =>
                        itemIndex === index ? Math.min(3, value + 1) : value,
                      ),
                    )
                  }
                  style={styles.gearCard}>
                  <Image
                    source={source}
                    style={styles.gearImage}
                    resizeMode="contain"
                  />

                  <View style={styles.track}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: `${(gear[index] / 3) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <PauseModal
            visible={paused}
            onResume={() => setPaused(false)}
            onHome={leaveTrip}
            onSettings={onSettings}
          />
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={scenery.lakeDepths}
      style={styles.fill}
      resizeMode="cover">
      <StatusBar hidden />

      <SafeAreaView style={styles.fill}>
        <View style={[styles.top, compact && styles.topCompact]}>
          <CreditBadge coins={coins} />

          <IconTileButton icon="Ⅱ" onPress={() => setPaused(true)} />
        </View>

        <View style={[styles.catchBadge, compact && styles.catchBadgeCompact]}>
          <Text style={styles.catchText}>
            Catch {caught}/{target}
          </Text>
        </View>

        {bubbleConfig.map((config, index) => (
          <RisingBubble
            key={index}
            config={config}
            paused={paused || complete}
          />
        ))}

        {activeFish.map(fish => (
          <SwimmingFish
            key={fish.id}
            source={lakeArt.swimmers[fish.sourceIndex]}
            fish={fish}
            speedMultiplier={fishSpeedMultiplier}
            paused={paused || complete}
            hidden={caughtFishId === fish.id}
            onPosition={registerFishPosition}
            onFinished={removeFish}
          />
        ))}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.hookLine,
            {
              transform: [
                {translateX: hook.x},
                {
                  translateY: hookDrop.interpolate({
                    inputRange: [0, 1],
                    outputRange: [hook.y, hook.y + HOOK_DROP_DISTANCE],
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.line} />

          <Image
            source={lakeArt.silverHook}
            style={styles.hook}
            resizeMode="contain"
          />

          {caughtFishSource !== null && (
            <Image
              source={caughtFishSource}
              style={styles.caughtFish}
              resizeMode="contain"
            />
          )}
        </Animated.View>

        <Animated.Text
          pointerEvents="none"
          style={[
            styles.plusOne,
            {
              opacity: plusOpacity,
              transform: [{translateX: hook.x}, {translateY: hook.y}],
            },
          ]}>
          +1
        </Animated.Text>

        <Animated.Text
          pointerEvents="none"
          style={[
            styles.missText,
            {
              opacity: missOpacity,
              transform: [{translateX: hook.x}, {translateY: hook.y}],
            },
          ]}>
          Miss
        </Animated.Text>

        <View
          style={[
            styles.controls,
            compact && styles.controlsCompact,
            Platform.OS === 'android' && styles.controlsAndroid,
            Platform.OS === 'android' &&
              compact &&
              styles.controlsCompactAndroid,
          ]}>
          <Pressable
            disabled={casting}
            style={[
              styles.control,
              styles.up,
              casting && styles.controlDisabled,
            ]}
            onPress={() => moveHook('up')}>
            <Text style={styles.arrow}>↑</Text>
          </Pressable>

          <Pressable
            disabled={casting}
            style={[
              styles.control,
              styles.left,
              casting && styles.controlDisabled,
            ]}
            onPress={() => moveHook('left')}>
            <Text style={styles.arrow}>←</Text>
          </Pressable>

          <Pressable
            disabled={casting}
            style={[
              styles.control,
              styles.catchControl,
              casting && styles.controlDisabled,
            ]}
            onPress={castHook}>
            <Text style={styles.catchIcon}>🎣</Text>
          </Pressable>

          <Pressable
            disabled={casting}
            style={[
              styles.control,
              styles.right,
              casting && styles.controlDisabled,
            ]}
            onPress={() => moveHook('right')}>
            <Text style={styles.arrow}>→</Text>
          </Pressable>

          <Pressable
            disabled={casting}
            style={[
              styles.control,
              styles.down,
              casting && styles.controlDisabled,
            ]}
            onPress={() => moveHook('down')}>
            <Text style={styles.arrow}>↓</Text>
          </Pressable>
        </View>

        <PauseModal
          visible={paused}
          onResume={() => setPaused(false)}
          onHome={leaveTrip}
          onSettings={onSettings}
        />

        <CompleteModal
          visible={complete}
          coins={caught * 10}
          finalLevel={level >= 11}
          onContinue={continueAfterResult}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

type SwimmingFishProps = {
  source: number;
  fish: ActiveFish;
  speedMultiplier: number;
  paused: boolean;
  hidden: boolean;
  onPosition: (index: number, position: FishPosition) => void;
  onFinished: (id: number) => void;
};

function SwimmingFish({
  source,
  fish,
  speedMultiplier,
  paused,
  hidden,
  onPosition,
  onFinished,
}: SwimmingFishProps) {
  const swim = useRef(new Animated.Value(0)).current;

  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const listenerId = swim.addListener(({value}) => {
      const swimmingRight = fish.direction === 'right';
      const startX = swimmingRight ? -130 : screenWidth + 120;
      const endX = swimmingRight ? screenWidth + 120 : -130;

      const x = startX + (endX - startX) * value;

      onPosition(fish.id, {
        x: x + 52,
        y: fish.top + 39 + Math.sin(value * Math.PI * 4) * 6,
      });
    });

    return () => {
      swim.removeListener(listenerId);
    };
  }, [fish.direction, fish.id, fish.top, onPosition, swim]);

  useEffect(() => {
    if (paused) {
      animationRef.current?.stop();
      return;
    }

    swim.setValue(0);

    const animation = Animated.timing(swim, {
      toValue: 1,
      duration: BASE_SWIM_DURATION / speedMultiplier,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    animationRef.current = animation;
    animation.start(({finished}) => {
      if (finished) {
        onFinished(fish.id);
      }
    });

    return () => {
      animation.stop();
    };
  }, [fish.id, onFinished, paused, speedMultiplier, swim]);

  const translateX = swim.interpolate({
    inputRange: [0, 1],
    outputRange:
      fish.direction === 'right'
        ? [-130, screenWidth + 120]
        : [screenWidth + 120, -130],
  });

  const translateY = swim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -6, 3, -5, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.swimmer,
        {
          top: fish.top,
          opacity: hidden ? 0 : 1,
          transform: [{translateX}, {translateY}],
        },
      ]}>
      <Image source={source} style={styles.fish} resizeMode="contain" />
    </Animated.View>
  );
}

type RisingBubbleProps = {
  config: (typeof bubbleConfig)[number];
  paused: boolean;
};

function RisingBubble({config, paused}: RisingBubbleProps) {
  const rise = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (paused) {
      animationRef.current?.stop();
      return;
    }

    rise.setValue(0);

    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(config.delay),
        Animated.timing(rise, {
          toValue: 1,
          duration: config.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );

    animationRef.current = animation;
    animation.start();

    return () => animation.stop();
  }, [config.delay, config.duration, paused, rise]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.bubble,
        {
          left: config.left,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          opacity: rise.interpolate({
            inputRange: [0, 0.08, 0.82, 1],
            outputRange: [0, 0.75, 0.5, 0],
          }),
          transform: [
            {
              translateY: rise.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -screenHeight * 0.82],
              }),
            },
            {
              scale: rise.interpolate({
                inputRange: [0, 1],
                outputRange: [0.75, 1.25],
              }),
            },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },

  top: {
    position: 'absolute',
    zIndex: 10,
    left: 10,
    right: 10,
    top: 46,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topCompact: {top: 18},

  gearArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 62,
  },
  gearAreaCompact: {paddingBottom: 18},

  gearRow: {
    height: 165,
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 8,
    marginTop: 10,
  },
  gearRowCompact: {height: 138},

  gearCard: {
    flex: 1,
    backgroundColor: cafePalette.darkBlue,
    borderWidth: 7,
    borderColor: cafePalette.outline,
    borderRadius: 25,
    padding: 7,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  gearImage: {
    width: '100%',
    height: 105,
  },

  track: {
    height: 9,
    backgroundColor: '#d9e9ff',
    borderRadius: 5,
    width: '90%',
    overflow: 'hidden',
  },

  bar: {
    height: '100%',
    backgroundColor: cafePalette.yellow,
  },

  catchBadge: {
    position: 'absolute',
    zIndex: 8,
    top: 118,
    alignSelf: 'center',
    backgroundColor: cafePalette.blue,
    borderWidth: 4,
    borderColor: cafePalette.outline,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  catchBadgeCompact: {top: 78, paddingVertical: 7},

  catchText: {
    color: cafePalette.white,
    fontSize: 22,
    fontWeight: '900',
  },

  hookLine: {
    position: 'absolute',
    zIndex: 7,
    top: HOOK_START_TOP,
    left: '48%',
    alignItems: 'center',
  },

  line: {
    height: LINE_HEIGHT,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },

  hook: {
    width: 46,
    height: 82,
    marginTop: -12,
  },

  caughtFish: {
    position: 'absolute',
    top: LINE_HEIGHT + 28,
    left: 15,
    width: 90,
    height: 68,
  },

  plusOne: {
    position: 'absolute',
    zIndex: 12,
    top: '57%',
    left: '47%',
    color: cafePalette.yellow,
    fontSize: 35,
    fontWeight: '900',
    textShadowColor: '#16599c',
    textShadowRadius: 4,
  },

  missText: {
    position: 'absolute',
    zIndex: 12,
    top: '57%',
    left: '43%',
    color: cafePalette.white,
    fontSize: 27,
    fontWeight: '900',
    textShadowColor: '#16599c',
    textShadowRadius: 4,
  },

  swimmer: {
    position: 'absolute',
    zIndex: 5,
    left: 0,
  },

  fish: {
    width: 105,
    height: 78,
  },

  bubble: {
    position: 'absolute',
    zIndex: 3,
    bottom: -18,
    borderWidth: 1.5,
    borderColor: 'rgba(225, 249, 255, 0.9)',
    backgroundColor: 'rgba(185, 235, 255, 0.18)',
  },

  controls: {
    position: 'absolute',
    zIndex: 9,
    bottom: 20,
    alignSelf: 'center',
    width: 190,
    height: 178,
  },
  controlsCompact: {bottom: -4, transform: [{scale: 0.84}]},
  controlsAndroid: {bottom: 35},
  controlsCompactAndroid: {bottom: 11},

  control: {
    position: 'absolute',
    width: 53,
    height: 53,
    borderRadius: 15,
    backgroundColor: cafePalette.blue,
    borderWidth: 4,
    borderColor: cafePalette.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },

  controlDisabled: {
    opacity: 0.55,
  },

  up: {
    top: 0,
    left: 68,
  },

  left: {
    top: 60,
    left: 8,
  },

  catchControl: {
    top: 60,
    left: 68,
  },

  right: {
    top: 60,
    right: 8,
  },

  down: {
    top: 120,
    left: 68,
  },

  arrow: {
    fontSize: 28,
    lineHeight: 31,
    color: cafePalette.white,
    fontWeight: '900',
  },

  catchIcon: {
    fontSize: 25,
  },
});
