import { useState, useEffect } from 'react';
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
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNotificationStore } from '../../store/notificationStore';
import {
  getNotifications,
  markRead as apiMarkRead,
  markAllRead as apiMarkAllRead,
} from '../../services/notifications';
import { AppNotification } from '../../types';
import { colors, spacing, radius, fontSizes, fontWeights } from '../../constants/theme';

type Props = {
  navigation: BottomTabNavigationProp<Record<string, undefined>>;
};

type IconConfig = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  bg: string;
};

function getIconConfig(type: string): IconConfig {
  switch (type) {
    case 'CLAIM_CONFIRMED':
      return { name: 'checkmark-circle', color: colors.successGreen, bg: colors.successGreenLight };
    case 'NEW_FOOD_NEARBY':
      return { name: 'restaurant-outline', color: colors.accentPrimary, bg: colors.accentLight };
    case 'FOOD_EXPIRING':
      return { name: 'time-outline', color: colors.warningYellow, bg: '#FEF3C7' };
    case 'RESTAURANT_UPDATE':
      return { name: 'business-outline', color: colors.textMuted, bg: colors.surfaceSecondary };
    case 'SPONSOR_RECEIVED':
      return { name: 'heart-outline', color: colors.warningYellow, bg: '#FEF9C3' };
    default:
      return { name: 'notifications-outline', color: colors.textMuted, bg: colors.surfaceSecondary };
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

export default function NotificationsScreen({ navigation }: Props) {
  const { notifications, setNotifications, markRead: storeMarkRead, markAllRead: storeMarkAllRead } =
    useNotificationStore();
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
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <ActivityIndicator style={{ flex: 1 }} color={colors.accentPrimary} />
      </SafeAreaView>
    );
  }

  if (notifications.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyCircle}>
            <Ionicons name="notifications-outline" size={48} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyHeading}>All caught up</Text>
          <Text style={styles.emptyBody}>
            When new food appears nearby or someone claims your donation, you'll see it here.
          </Text>
          <TouchableOpacity
            style={styles.browseBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Home' as never)}
          >
            <Text style={styles.browseBtnText}>Browse food</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>

      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={handleMarkAll} hitSlop={8}>
          <Ionicons name="options-outline" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => {
          const icon = getIconConfig(item.type);
          const isRead = item.readAt !== null;
          return (
            <TouchableOpacity
              style={[styles.row, isRead && styles.rowRead]}
              activeOpacity={0.75}
              onPress={() => handleTap(item.id)}
            >
              <View style={[styles.iconCircle, { backgroundColor: icon.bg }]}>
                <Ionicons name={icon.name} size={22} color={icon.color} />
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
                <Text style={styles.rowDesc} numberOfLines={2}>
                  {item.body}
                </Text>
              </View>
              {!isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
  },

  // List
  listContent: {
    paddingBottom: spacing['4xl'],
  },
  sectionHeader: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textMuted,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  rowRead: {
    opacity: 0.6,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
    gap: spacing.xs,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rowTitle: {
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    color: colors.textPrimary,
  },
  rowTitleRead: {
    fontWeight: fontWeights.regular,
  },
  rowTime: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: 2,
    flexShrink: 0,
  },
  rowDesc: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    lineHeight: 19,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accentPrimary,
    flexShrink: 0,
  },

  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    gap: spacing.lg,
  },
  emptyCircle: {
    width: 100,
    height: 100,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyHeading: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  browseBtn: {
    width: '100%',
    backgroundColor: colors.accentPrimary,
    borderRadius: radius.card,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  browseBtnText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    color: colors.textInverse,
  },
});
