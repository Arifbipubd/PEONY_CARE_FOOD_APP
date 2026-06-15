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
  navigation: NativeStackNavigationProp<HomeStackParamList, 'OfflineError'>;
  onRetry?: () => void;
};

export default function OfflineErrorScreen({ navigation, onRetry }: Props) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
        </View>
        <Text style={styles.heading}>No connection</Text>
        <Text style={styles.body}>
          We can't reach Peony Care servers right now.{'\n'}Check your Wi-Fi or mobile data and try again.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() => {
            if (onRetry) onRetry();
            else navigation.goBack();
          }}
        >
          <Text style={styles.primaryBtnText}>Try again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('ReceiverHome')}
        >
          <Text style={styles.secondaryBtnText}>Continue offline</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

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
    backgroundColor: colors.surfaceSecondary,
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
    borderRadius: radius.pill,
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
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },
});
