import { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNotificationStore } from '../../store/notificationStore';
import {
  getNotifications,
  markRead as apiMarkRead,
  markAllRead as apiMarkAllRead,
} from '../../services/notifications';
import { AppNotification } from '../../types';
import {
  colors, spacing, radius, fontSizes, fontWeights, fontFamilies, letterSpacings, layout,
} from '../../constants/theme';

type Props = {
  navigation: BottomTabNavigationProp<Record<string, undefined>>;
};

type IconConfig = {
  name: string;
  color: string;
  bg: string;
  library?: 'mci';
};

function getIconConfig(type: string): IconConfig {
  switch (type) {
    case 'CLAIM_CONFIRMED':
      return { name: 'checkmark-circle',   color: colors.successGreen,  bg: colors.successGreenLight };
    case 'NEW_FOOD_NEARBY':
      return { name: 'silverware-fork-knife', color: colors.accentPrimary, bg: colors.avatarBg, library: 'mci' as const };
    case 'FOOD_EXPIRING':
      return { name: 'time',               color: colors.goldDark,      bg: colors.goldLight };
    case 'RESTAURANT_UPDATE':
      return { name: 'business',           color: colors.textPrimary,   bg: colors.surfaceSecondary };
    case 'SPONSOR_RECEIVED':
      return { name: 'heart',              color: colors.goldDark,      bg: colors.goldLight };
    default:
      return { name: 'information-circle', color: colors.textPrimary,   bg: colors.surfaceSecondary };
  }
}

function relTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const diffDays = Math.round(diff / 86400000);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return new Date(isoString).toLocaleDateString('en-SG', { weekday: 'short' });
  return new Date(isoString).toLocaleDateString('en-SG', { month: 'short', day: 'numeric' });
}

function daysDiff(isoString: string): number {
  const notifDate = new Date(isoString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  notifDate.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - notifDate.getTime()) / 86400000);
}

function buildSections(notifications: AppNotification[]) {
  const ORDER = ['Today', 'Yesterday', 'This week', 'Earlier'] as const;
  const groups: Partial<Record<typeof ORDER[number], AppNotification[]>> = {};

  for (const n of notifications) {
    const d = daysDiff(n.createdAt);
    const label: typeof ORDER[number] =
      d === 0 ? 'Today' : d === 1 ? 'Yesterday' : d < 7 ? 'This week' : 'Earlier';
    if (!groups[label]) groups[label] = [];
    groups[label]!.push(n);
  }

  return ORDER.filter((label) => groups[label]).map((label) => ({
    title: label,
    data: groups[label]!,
  }));
}

const NotifRow = memo(function NotifRow({
  item,
  onPress,
}: {
  item: AppNotification;
  onPress: (id: string) => void;
}) {
  const icon   = getIconConfig(item.type);
  const isRead = item.readAt !== null;
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.75}
      onPress={() => onPress(item.id)}
    >
      <View style={[styles.iconCircle, { backgroundColor: icon.bg }]}>
        {icon.library === 'mci'
          ? <MaterialCommunityIcons name={icon.name as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={22} color={icon.color} />
          : <Ionicons name={icon.name as React.ComponentProps<typeof Ionicons>['name']} size={22} color={icon.color} />
        }
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text
            style={[styles.rowTitle, isRead && styles.rowTitleRead]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.rowTime}>{relTime(item.createdAt)}</Text>
        </View>
        <Text style={styles.rowDesc} numberOfLines={2}>{item.body}</Text>
      </View>
      {!isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
});

export default function NotificationsScreen({ navigation }: Props) {
  const {
    notifications, setNotifications,
    markRead: storeMarkRead, markAllRead: storeMarkAllRead,
  } = useNotificationStore();
  const [loading, setLoading] = useState(notifications.length === 0);

  useEffect(() => {
    getNotifications().then((items) => {
      setNotifications(items);
      setLoading(false);
    });
  }, []);

  const handleTap = (id: string) => {
    storeMarkRead(id);
    apiMarkRead(id);
  };

  const handleMarkAll = () => {
    storeMarkAllRead();
    apiMarkAllRead();
  };

  const sections = buildSections(notifications);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.filterRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Home' as never)} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMarkAll} hitSlop={8}>
            <Ionicons name="options" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <Text style={styles.pageTitle}>Notifications</Text>
        <ActivityIndicator style={{ flex: 1 }} color={colors.accentPrimary} />
      </SafeAreaView>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (notifications.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.filterRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Home' as never)} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleMarkAll} hitSlop={8}>
            <Ionicons name="options" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <Text style={styles.pageTitle}>Notifications</Text>
        <View style={styles.emptyBody}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="notifications" size={48} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>All caught up</Text>
          <Text style={styles.emptyDesc}>
            When new food appears nearby or someone claims your donation, you'll see it here.
          </Text>
          <TouchableOpacity
            style={styles.emptyCta}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Home' as never)}
          >
            <Text style={styles.emptyCtaText}>Browse food</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Filled state ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>

      <View style={styles.filterRow}>
        <TouchableOpacity onPress={() => navigation.navigate('Home' as never)} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMarkAll} hitSlop={8}>
          <Ionicons name="options" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
      <Text style={styles.pageTitle}>Notifications</Text>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => <NotifRow item={item} onPress={handleTap} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        stickySectionHeadersEnabled={false}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  // ── Header ───────────────────────────────────────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
  },
  pageTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    paddingTop: 4,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 16,
  },

  // ── Section header ───────────────────────────────────────────────────────────
  sectionHeader: {
    fontSize: fontSizes['12'],
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.medium,
    color: colors.textMuted,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },

  // ── Notification row ─────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: spacing['4xl'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: spacing.lg,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowBody: { flex: 1 },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rowTitle: {
    flex: 1,
    fontSize: fontSizes['14'],
    fontWeight: fontWeights.semiBold,
    fontFamily: fontFamilies.semiBold,
    letterSpacing: -0.21,
    color: colors.textPrimary,
  },
  rowTitleRead: {
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.regular,
  },
  rowTime: {
    fontSize: fontSizes['12'],
    fontWeight: fontWeights.medium,
    fontFamily: fontFamilies.medium,
    color: colors.textMuted,
    flexShrink: 0,
    marginTop: 2,
  },
  rowDesc: {
    fontSize: fontSizes['12'],
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.regular,
    color: colors.textMuted,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accentPrimary,
    flexShrink: 0,
  },

  // ── Empty state ───────────────────────────────────────────────────────────────
  emptyBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  emptyTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyDesc: {
    fontSize: fontSizes['14'],
    fontWeight: fontWeights.regular,
    fontFamily: fontFamilies.regular,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  emptyCta: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    height: layout.buttonHeight,
    marginTop: spacing['2xl'],
    marginHorizontal: 20,
    shadowColor: colors.accentPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyCtaText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.button,
    color: colors.textInverse,
  },
});
