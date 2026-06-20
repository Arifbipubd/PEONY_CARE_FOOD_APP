import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSizes, fontWeights, spacing } from '../constants/theme';

export default function PlaceholderScreen({ route }: { route?: RouteProp<any, any> }) {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.screen}>
      {navigation.canGoBack() && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      )}
      <View style={styles.center}>
        <Text style={styles.label}>{route?.name ?? 'Screen'}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  back: {
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.medium,
    color: colors.textMuted,
  },
});
