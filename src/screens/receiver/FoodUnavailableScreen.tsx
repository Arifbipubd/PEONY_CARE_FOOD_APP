import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, fontSizes, fontWeights } from '../../constants/theme';
import { HomeStackParamList } from '../../navigation/ReceiverTabs';

type Props = {
  navigation: NativeStackNavigationProp<HomeStackParamList, 'FoodUnavailable'>;
};

export default function FoodUnavailableScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="fast-food-outline" size={48} color={colors.accentPrimary} />
        </View>
        <Text style={styles.heading}>Just claimed</Text>
        <Text style={styles.body}>
          Someone else collected this meal before you.{'\n'}Don't worry — there's more food nearby.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ReceiverHome')}
        >
          <Text style={styles.primaryBtnText}>Find other food</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7}>
          <Text style={styles.secondaryBtnText}>Open map</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  header: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    gap: spacing.lg,
  },

  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: radius.pill,
    backgroundColor: '#FEF0E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  heading: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  actions: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
});
