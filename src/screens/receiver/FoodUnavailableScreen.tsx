import { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { HomeStackParamList } from '../../navigation/ReceiverTabs';
import {
  colors,
  spacing,
  radius,
  fontSizes,
  fontFamilies,
} from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'FoodUnavailable'>;
  route: RouteProp<HomeStackParamList, 'FoodUnavailable'>;
};

export default function FoodUnavailableScreen({ navigation, route }: Props) {
  const nearbyCount = route.params?.nearbyCount ?? 0;

  const handleFindOther = useCallback(
    () => navigation.navigate('ReceiverHome'),
    [navigation],
  );

  const handleFasterAlerts = useCallback(() => {
    Linking.openSettings();
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>

      {/* Back arrow */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Centred content */}
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="gift" size={52} color={colors.pickupOrange} />
        </View>

        <Text style={styles.title}>Beat you to it</Text>
        <Text style={styles.desc}>
          Someone else claimed this meal first. The good news — there are still more donations nearby.
        </Text>

        {nearbyCount > 0 && (
          <View style={styles.nearbyChip}>
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={14}
              color={colors.successGreen}
            />
            <Text style={styles.nearbyText}>{nearbyCount} meals still nearby</Text>
          </View>
        )}
      </View>

      {/* Bottom actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={handleFindOther}
        >
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={18}
            color={colors.textInverse}
          />
          <Text style={styles.primaryBtnText}>Find other food</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.7}
          onPress={handleFasterAlerts}
        >
          <Ionicons name="notifications" size={18} color={colors.textPrimary} />
          <Text style={styles.secondaryBtnText}>Get faster alerts</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginLeft: spacing['2xl'],
    marginTop: spacing.lg,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },

  iconCircle: {
    width: 128,
    height: 128,
    borderRadius: radius.pill,
    backgroundColor: colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    lineHeight: 28.8,
    letterSpacing: -0.6,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },

  desc: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
  },

  nearbyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mintLight,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 22,
    gap: 6,
  },
  nearbyText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['12'],
    color: colors.successGreen,
  },

  actions: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    height: 54,
    gap: 8,
  },
  primaryBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: 0.3,
    color: colors.textInverse,
  },

  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
    height: 54,
    marginTop: 10,
    gap: 8,
  },
  secondaryBtnText: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.md,
    letterSpacing: 0.3,
    color: colors.textPrimary,
  },
});
