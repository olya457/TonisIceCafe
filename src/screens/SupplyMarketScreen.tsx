import React, {useState} from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {scenery, pantryArt} from '../assets';
import {IconTileButton} from '../components/IconTileButton';
import {CreditBadge} from '../components/GuestStatusRibbon';
import {cafePalette} from '../theme/cafePalette';

const items = [
  {
    id: 'plate',
    image: pantryArt.dish,
    price: 150,
    name: 'Plate',
    upgrade: 'Portions 2 → 3',
  },
  {
    id: 'counter',
    image: pantryArt.station,
    price: 400,
    name: 'Counter',
    upgrade: 'Worktops 3 → 4',
  },
  {
    id: 'tea-pot',
    image: pantryArt.kettle,
    price: 300,
    name: 'Tea pot',
    upgrade: 'Tea cups 1 → 2',
  },
  {
    id: 'sauce-set',
    image: pantryArt.amberDressing,
    price: 180,
    name: 'Sauce Set',
    upgrade: 'Sauces 1 → 2',
  },
  {
    id: 'tea-cup',
    image: pantryArt.cup,
    price: 220,
    name: 'Tea Cup',
    upgrade: 'Tea reward +5',
  },
  {
    id: 'lemon-tray',
    image: pantryArt.citrus,
    price: 260,
    name: 'Lemon Tray',
    upgrade: 'Fish reward +5',
  },
] as const;

type SupplyMarketScreenProps = {
  coins: number;
  hearts: number;
  purchasedItems: string[];
  onBuy: (id: string, price: number) => boolean;
  onBuyHeart: () => boolean;
  onHome: () => void;
  onFishing: () => void;
  onSettings: () => void;
};

export function SupplyMarketScreen({
  coins,
  hearts,
  purchasedItems,
  onBuy,
  onBuyHeart,
  onHome,
  onFishing,
  onSettings,
}: SupplyMarketScreenProps) {
  const {height} = useWindowDimensions();
  const compact = height < 720;
  const [missingCoins, setMissingCoins] = useState<number | null>(null);

  const buy = (item: (typeof items)[number]) => {
    if (purchasedItems.includes(item.id)) {
      return;
    }

    if (coins < item.price) {
      setMissingCoins(item.price - coins);
      return;
    }

    onBuy(item.id, item.price);
  };

  return (
    <ImageBackground
      source={scenery.cafeMap}
      style={styles.fill}
      resizeMode="cover">
      <SafeAreaView
        style={[
          styles.content,
          Platform.OS === 'android' && styles.contentAndroid,
        ]}>
        <View style={styles.header}>
          <IconTileButton icon="‹" onPress={onHome} />
          <Text
            style={styles.title}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.82}>
            Toni’s Supplies
          </Text>
          <CreditBadge coins={coins} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.list,
            compact && styles.listCompact,
            Platform.OS === 'android' && styles.listAndroid,
            Platform.OS === 'android' && compact && styles.listCompactAndroid,
          ]}>
          <Pressable
            onPress={() => {
              if (!onBuyHeart()) {
                setMissingCoins(10 - coins);
              }
            }}
            style={({pressed}) => [
              styles.item,
              coins < 10 && styles.unaffordableItem,
              pressed && styles.pressedItem,
            ]}>
            <View style={styles.imageBox}>
              <Text style={styles.heartIcon}>♥</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.name}>Extra Life</Text>
              <Text style={styles.upgrade}>You have {hearts} lives</Text>
            </View>
            <View style={styles.buyButton}>
              <Text style={styles.price}>● 10</Text>
            </View>
          </Pressable>
          {items.map(item => {
            const purchased = purchasedItems.includes(item.id);
            const affordable = coins >= item.price;

            return (
              <Pressable
                key={item.id}
                onPress={() => buy(item)}
                style={({pressed}) => [
                  styles.item,
                  purchased && styles.purchasedItem,
                  !purchased && !affordable && styles.unaffordableItem,
                  pressed && styles.pressedItem,
                ]}>
                <View style={styles.imageBox}>
                  <Image
                    source={item.image}
                    style={styles.image}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.upgrade}>{item.upgrade}</Text>
                </View>
                <View style={styles.buyButton}>
                  <Text style={styles.price}>
                    {purchased ? '✓ Bought' : `● ${item.price}`}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={[styles.nav, compact && styles.navCompact]}>
          <Nav icon="🎣" label="Lake" onPress={onFishing} />
          <Nav icon="🚚" label="Supplies" active onPress={() => {}} />
          <Nav icon="🐟" label="Bistro" onPress={onHome} />
          <Nav icon="📖" label="Options" onPress={onSettings} />
        </View>

        <Modal
          transparent
          visible={missingCoins !== null}
          animationType="fade"
          onRequestClose={() => setMissingCoins(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Not enough café coins</Text>
              <Text style={styles.modalText}>
                You need {missingCoins ?? 0} more coins for this purchase. Go to
                the café and serve customers to earn them.
              </Text>
              <Pressable
                style={styles.cafeButton}
                onPress={() => {
                  setMissingCoins(null);
                  onHome();
                }}>
                <Text style={styles.cafeButtonText}>Go to Café</Text>
              </Pressable>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setMissingCoins(null)}>
                <Text style={styles.cancelButtonText}>Continue shopping</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
  content: {flex: 1, backgroundColor: 'rgba(0,40,90,.25)'},
  contentAndroid: {paddingTop: 15},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  title: {
    flex: 1,
    fontFamily: 'Georgia',
    fontSize: 25,
    fontWeight: '900',
    color: cafePalette.white,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  list: {padding: 12, gap: 15, paddingBottom: 125},
  listCompact: {paddingTop: 4, gap: 10, paddingBottom: 96},
  listAndroid: {paddingBottom: 140},
  listCompactAndroid: {paddingBottom: 111},
  item: {
    minHeight: 108,
    borderRadius: 18,
    backgroundColor: cafePalette.darkBlue,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  purchasedItem: {borderColor: '#69e49b', backgroundColor: '#1765ba'},
  unaffordableItem: {opacity: 0.72},
  pressedItem: {transform: [{scale: 0.985}]},
  imageBox: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: cafePalette.blue,
    borderWidth: 5,
    borderColor: cafePalette.outline,
    padding: 6,
  },
  image: {width: '100%', height: '100%'},
  heartIcon: {color: '#ff3dab', fontSize: 50, fontWeight: '900'},
  copy: {flex: 1},
  name: {color: cafePalette.white, fontSize: 18, fontWeight: '900'},
  upgrade: {color: '#fff16c', fontWeight: '800', marginTop: 8},
  buyButton: {
    minWidth: 84,
    backgroundColor: cafePalette.blue,
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 10,
    alignItems: 'center',
  },
  price: {color: cafePalette.white, fontSize: 15, fontWeight: '900'},
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 21, 48, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: cafePalette.blue,
    borderWidth: 6,
    borderColor: cafePalette.outline,
    borderRadius: 28,
    padding: 22,
    alignItems: 'center',
  },
  modalTitle: {
    color: cafePalette.white,
    fontFamily: 'Georgia',
    fontWeight: '900',
    fontSize: 25,
    textAlign: 'center',
  },
  modalText: {
    color: cafePalette.white,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 18,
  },
  cafeButton: {
    width: '100%',
    backgroundColor: cafePalette.darkBlue,
    borderWidth: 4,
    borderColor: cafePalette.outline,
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: 'center',
  },
  cafeButtonText: {color: cafePalette.white, fontSize: 19, fontWeight: '900'},
  cancelButton: {paddingVertical: 13, paddingHorizontal: 12},
  cancelButtonText: {color: cafePalette.white, fontWeight: '800'},
});
