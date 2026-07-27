import React, {useEffect, useState} from 'react';
import {Image, ImageBackground, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import {scenery, winterGuests, pantryArt} from '../assets';
import {CompleteModal, GameOverModal, PauseModal} from '../components/CafeDialogs';
import {IconTileButton} from '../components/IconTileButton';
import {GuestStatusRibbon} from '../components/GuestStatusRibbon';
import {SERVICE_MILESTONES} from '../data/serviceMilestones';
import {cafePalette} from '../theme/cafePalette';

type FishState = 'raw' | 'searing' | 'ready' | 'plated';
type Sauce = 'orange' | 'yellow' | null;

const recipes = [
  {name: 'Green Fish', image: pantryArt.herbFillet, needsTea: false, needsLemon: false},
  {name: 'Fish & Tea', image: pantryArt.chefSpecial, needsTea: true, needsLemon: false},
  {name: 'Lemon Fish', image: pantryArt.chefSpecial, needsTea: false, needsLemon: true},
] as const;

const randomDifferentIndex = (current: number, length: number) =>
  (current + 1 + Math.floor(Math.random() * (length - 1))) % length;

export function BistroKitchenScreen({level, coins, hearts, onCoins, onLoseHeart, onHome, onGameOver, onLevelComplete, onSettings}: {level: number; coins: number; hearts: number; onCoins: (n: number) => void; onLoseHeart: () => void; onHome: () => void; onGameOver: () => void; onLevelComplete: () => void; onSettings: () => void}) {
  const {height} = useWindowDimensions();
  const compact = height < 720;
  const target = SERVICE_MILESTONES[level - 1][0];
  const [served, setServed] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [teapotVisible, setTeapotVisible] = useState(false);
  const [cupVisible, setCupVisible] = useState(false);
  const [greensOnPlate, setGreensOnPlate] = useState(false);
  const [lemonOnPlate, setLemonOnPlate] = useState(false);
  const [sauceOnPlate, setSauceOnPlate] = useState<Sauce>(null);
  const [fishState, setFishState] = useState<FishState>('raw');
  const [fishAvailable, setFishAvailable] = useState(true);
  const [cookingSeconds, setCookingSeconds] = useState(3);
  const [recipeIndex, setRecipeIndex] = useState(0);
  const [customerIndex, setCustomerIndex] = useState(0);
  const [usedCustomers, setUsedCustomers] = useState<number[]>([0]);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const [orderSeconds, setOrderSeconds] = useState(30);
  const recipe = recipes[recipeIndex];
  const orderReady = fishState === 'plated' && (!recipe.needsTea || cupVisible) && (!recipe.needsLemon || lemonOnPlate);

  useEffect(() => {
    if (fishState !== 'searing' || paused || hearts <= 0) return;
    if (cookingSeconds <= 0) {
      setFishState('ready');
      return;
    }
    const timer = setTimeout(() => setCookingSeconds(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cookingSeconds, fishState, hearts, paused]);

  useEffect(() => {
    if (paused || complete || orderReady || hearts <= 0) return;
    if (orderSeconds <= 0) {
      onLoseHeart();
      setOrderSeconds(30);
      setFishState('raw');
      setFishAvailable(true);
      setCookingSeconds(3);
      setGreensOnPlate(false);
      setLemonOnPlate(false);
      setSauceOnPlate(null);
      setTeapotVisible(false);
      setCupVisible(false);
      return;
    }
    const timer = setTimeout(() => setOrderSeconds(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [complete, hearts, onLoseHeart, orderReady, orderSeconds, paused]);

  const putFishInPan = () => {
    if (fishState === 'raw' && fishAvailable) {
      setFishAvailable(false);
      setCookingSeconds(3);
      setFishState('searing');
    }
  };

  const moveFishToPlate = () => {
    if (fishState === 'ready' && greensOnPlate) setFishState('plated');
  };

  const clearWorktop = () => {
    setFishState('raw');
    setFishAvailable(true);
    setCookingSeconds(3);
    setGreensOnPlate(false);
    setLemonOnPlate(false);
    setSauceOnPlate(null);
    setTeapotVisible(false);
    setCupVisible(false);
  };

  const showNextCustomer = () => {
    let available = winterGuests.map((_, index) => index).filter(index => !usedCustomers.includes(index));
    if (available.length === 0) available = winterGuests.map((_, index) => index).filter(index => index !== customerIndex);
    const nextIndex = available[Math.floor(Math.random() * available.length)];
    setCustomerIndex(nextIndex);
    setUsedCustomers(current => current.length >= winterGuests.length ? [nextIndex] : [...current, nextIndex]);
  };

  const serveDish = () => {
    if (!orderReady) return;
    onCoins(10);
    setEarnedCoins(value => value + 10);
    setOrderSeconds(30);
    clearWorktop();

    const nextCustomerCount = served + 1;
    setServed(nextCustomerCount);
    if (nextCustomerCount >= target) {
      setComplete(true);
      return;
    }

    setRecipeIndex(index => randomDifferentIndex(index, recipes.length));
    showNextCustomer();
  };

  const leaveShift = () => {
    setPaused(false);
    setComplete(false);
    setTimeout(onHome, 0);
  };

  const continueAfterResult = () => {
    setComplete(false);
    setTimeout(onLevelComplete, 0);
  };

  return <ImageBackground source={scenery.diningRoom} style={styles.fill} resizeMode="cover">
    <StatusBar hidden />
    <SafeAreaView style={styles.fill}>
      <GuestStatusRibbon hearts={hearts} coins={coins} onSettings={onSettings} showSettings={false} />
      <View style={[styles.orderTimer, orderSeconds <= 10 && styles.orderTimerDanger]}><Text style={styles.orderTimerText}>⏱ {orderSeconds}</Text></View>

      <Pressable style={[styles.customerArea, compact && styles.customerAreaCompact]} onPress={serveDish}>
        <Image source={winterGuests[customerIndex]} style={styles.customer} resizeMode="contain" />
        <View style={styles.orderCard}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <Image source={recipe.image} style={styles.orderDish} resizeMode="contain" />
          {recipe.needsTea && <><Text style={styles.orderPlus}>+</Text><Image source={pantryArt.cup} style={styles.orderMug} resizeMode="contain" /></>}
          {recipe.needsLemon && <><Text style={styles.orderPlus}>+</Text><Image source={pantryArt.citrus} style={styles.orderMug} resizeMode="contain" /></>}
        </View>
      </Pressable>

      <View style={[styles.kitchenArea, compact && styles.kitchenAreaCompact]}>
        <Image source={pantryArt.station} style={styles.counter} resizeMode="stretch" />

        <Pressable style={styles.teapotSlot} onPress={() => setTeapotVisible(true)}>
          {teapotVisible && <Image source={pantryArt.kettle} style={styles.teapot} resizeMode="contain" />}
        </Pressable>
        <Pressable style={styles.cupSlot} onPress={() => teapotVisible && setCupVisible(true)}>
          {cupVisible && <Image source={pantryArt.cup} style={styles.cup} resizeMode="contain" />}
        </Pressable>

        <View style={styles.plateOne}>
          <Image source={pantryArt.dish} style={styles.plate} resizeMode="contain" />
          {greensOnPlate && fishState !== 'plated' && <Image source={pantryArt.herbs} style={styles.plateGreens} resizeMode="contain" />}
          {lemonOnPlate && fishState !== 'plated' && <Image source={pantryArt.citrus} style={styles.plateLemon} resizeMode="contain" />}
          {sauceOnPlate && <Image source={sauceOnPlate === 'orange' ? pantryArt.amberDressing : pantryArt.lemonDressing} style={styles.plateSauce} resizeMode="contain" />}
          {fishState === 'plated' && <View style={styles.finishedPress}><Image source={recipe.image} style={styles.finishedDish} resizeMode="contain" /></View>}
        </View>
        <View style={styles.plateTwo}><Image source={pantryArt.dish} style={styles.plate} resizeMode="contain" /></View>

        <Pressable style={styles.pan} onPress={moveFishToPlate}>
          {fishState === 'searing' && <View style={styles.timer}><Text style={styles.timerText}>{cookingSeconds}</Text></View>}
          {fishState === 'ready' && <Image source={pantryArt.fillet} style={styles.panFish} resizeMode="contain" />}
        </Pressable>

        <Pressable style={styles.orangeSauceSlot} onPress={() => setSauceOnPlate('orange')}>
          <Image source={pantryArt.amberDressing} style={styles.sauceBowl} resizeMode="contain" />
        </Pressable>
        <Pressable style={styles.yellowSauceSlot} onPress={() => setSauceOnPlate('yellow')}>
          <Image source={pantryArt.lemonDressing} style={styles.sauceBowl} resizeMode="contain" />
        </Pressable>

        <Pressable style={styles.rawFishPress} onPress={putFishInPan}>
          {fishAvailable && <Image source={pantryArt.fillet} style={styles.shelfFish} resizeMode="contain" />}
        </Pressable>
        <Pressable style={styles.rawGreensPress} onPress={() => setGreensOnPlate(true)}>
          {!greensOnPlate && <Image source={pantryArt.herbs} style={styles.shelfGreens} resizeMode="contain" />}
        </Pressable>
        <Pressable style={styles.rawLemonPress} onPress={() => recipe.needsLemon && setLemonOnPlate(true)}>
          {recipe.needsLemon && !lemonOnPlate && <Image source={pantryArt.citrus} style={styles.shelfLemon} resizeMode="contain" />}
        </Pressable>
      </View>

      <Pressable disabled={!orderReady} onPress={serveDish} style={[styles.progress, compact && styles.progressCompact, orderReady && styles.progressReady]}><Text style={[styles.progressText, compact && styles.progressTextCompact]}>{orderReady ? 'Tap customer to serve' : `${served}/${target} customers`}</Text></Pressable>
      <View style={[styles.pause, compact && styles.pauseCompact]}><IconTileButton icon="Ⅱ" onPress={() => setPaused(true)} /></View>
      <PauseModal visible={paused} onResume={() => setPaused(false)} onHome={leaveShift} onSettings={onSettings} />
      <CompleteModal visible={complete} coins={earnedCoins} finalLevel={level >= 11} onContinue={continueAfterResult} />
      <GameOverModal visible={hearts <= 0 && !complete} onRestart={onGameOver} />
    </SafeAreaView>
  </ImageBackground>;
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  customerArea: {position: 'absolute', top: '12%', left: 0, right: 0, height: '42%', alignItems: 'center', justifyContent: 'flex-end', zIndex: 1},
  customerAreaCompact: {top: '11%', height: '41%'},
  customer: {height: '112%', width: '68%', transform: [{translateY: 90}]},
  orderCard: {position: 'absolute', right: '5%', top: '3%', width: 82, minHeight: 132, paddingVertical: 7, borderRadius: 13, backgroundColor: cafePalette.white, borderWidth: 3, borderColor: cafePalette.outline, alignItems: 'center', justifyContent: 'space-around'},
  recipeName: {fontSize: 9, color: cafePalette.darkBlue, fontWeight: '900', textAlign: 'center'}, orderDish: {width: 58, height: 45}, orderMug: {width: 36, height: 31}, orderPlus: {fontSize: 16, fontWeight: '900', color: cafePalette.darkBlue},
  kitchenArea: {position: 'absolute', left: 0, right: 0, top: '52%', height: '39%', zIndex: 2},
  kitchenAreaCompact: {top: '50%', height: '40%'},
  counter: {position: 'absolute', width: '100%', height: '100%'},
  teapotSlot: {position: 'absolute', left: '3%', top: '4%', width: '15%', height: '15%', alignItems: 'center', justifyContent: 'center'}, teapot: {width: 52, height: 45},
  cupSlot: {position: 'absolute', left: '4%', top: '18%', width: '13%', height: '13%', alignItems: 'center', justifyContent: 'center'}, cup: {width: 39, height: 34},
  plateOne: {position: 'absolute', left: '21%', top: '16%', width: '18%', height: '16%', alignItems: 'center', justifyContent: 'center'},
  plateTwo: {position: 'absolute', left: '40%', top: '16%', width: '18%', height: '16%', alignItems: 'center', justifyContent: 'center'},
  plate: {position: 'absolute', width: '100%', height: '100%'}, plateGreens: {width: '72%', height: '72%'}, plateLemon: {position: 'absolute', right: 0, bottom: 0, width: '45%', height: '45%'}, plateSauce: {position: 'absolute', left: '30%', top: '34%', width: '40%', height: '40%', zIndex: 3},
  finishedPress: {width: 90, height: 74, alignItems: 'center', justifyContent: 'center'}, finishedDish: {width: 100, height: 82},
  pan: {position: 'absolute', right: '4%', top: '15%', width: '18%', height: '17%', alignItems: 'center', justifyContent: 'center'}, panFish: {width: 62, height: 52},
  timer: {width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,154,38,.9)', alignItems: 'center', justifyContent: 'center'}, timerText: {fontSize: 22, color: cafePalette.white, fontWeight: '900'},
  orangeSauceSlot: {position: 'absolute', left: '2%', top: '33%', width: '18%', height: '14%', alignItems: 'center', justifyContent: 'center'}, yellowSauceSlot: {position: 'absolute', left: '21%', top: '33%', width: '18%', height: '14%', alignItems: 'center', justifyContent: 'center'}, sauceBowl: {width: '76%', height: '76%'},
  rawFishPress: {position: 'absolute', left: '20%', bottom: '2%', width: '20%', height: '19%', alignItems: 'center', justifyContent: 'center'}, rawGreensPress: {position: 'absolute', left: '40%', bottom: '2%', width: '20%', height: '19%', alignItems: 'center', justifyContent: 'center'}, rawLemonPress: {position: 'absolute', left: '60%', bottom: '2%', width: '18%', height: '19%', alignItems: 'center', justifyContent: 'center'},
  shelfFish: {width: 68, height: 57}, shelfGreens: {width: 68, height: 57}, shelfLemon: {width: 58, height: 50},
  progress: {position: 'absolute', left: 12, bottom: 38, backgroundColor: cafePalette.darkBlue, borderWidth: 3, borderColor: cafePalette.outline, borderRadius: 15, paddingHorizontal: 14, paddingVertical: 10}, progressReady: {backgroundColor: '#25a85a'}, progressText: {color: cafePalette.white, fontWeight: '900', fontSize: 15},
  progressCompact: {left: 8, bottom: 8, paddingHorizontal: 10, paddingVertical: 7}, progressTextCompact: {fontSize: 13},
  orderTimer: {position: 'absolute', right: 18, top: 58, minWidth: 72, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, backgroundColor: cafePalette.darkBlue, borderWidth: 3, borderColor: cafePalette.outline, alignItems: 'center', zIndex: 5}, orderTimerDanger: {backgroundColor: '#dc3f50'}, orderTimerText: {color: cafePalette.white, fontSize: 17, fontWeight: '900'},
  pause: {position: 'absolute', right: 12, bottom: 32},
  pauseCompact: {right: 8, bottom: 6, transform: [{scale: 0.86}]},
});
