import { useState, useCallback, useMemo, memo, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import {
  getNotifications,
  getUnreadCount,
  markRead as apiMarkRead,
  markAllRead as apiMarkAllRead,
} from '../../services/notifications';
import { AppNotification } from '../../types';
import {
  colors, spacing, radius, fontSizes, fontFamilies, letterSpacings, layout,
} from '../../constants/theme';

type Props = {
  // Shared across role tab navigators — destinations differ by role.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: BottomTabNavigationProp<any>;
};

type IconConfig = {
  name: string;
  color: string;
  bg: string;
  library?: 'mci';
};

type Section = {
  key: string;
  title: string;
  data: AppNotification[];
};

/** Read an ID from payload — accepts string or number, tries several key aliases. */
function payloadId(
  payload: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.length > 0) return value;
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return null;
}

function isClaimConfirmationType(type: string): boolean {
  return (
    type === 'CLAIM_CONFIRMED' ||
    type === 'MEAL_CLAIMED' ||
    type === 'CLAIM_COLLECTED' ||
    type === 'CLAIM_SUCCESS'
  );
}

function isNewFoodType(type: string): boolean {
  return type === 'NEW_FOOD_NEARBY' || type === 'FOOD_EXPIRING';
}

/** Open the screen linked to this notification (food detail, restaurant, claims, …). */
function navigateFromNotification(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: BottomTabNavigationProp<any>,
  item: AppNotification,
  role: string | undefined,
) {
  const foodId = payloadId(
    item.payload,
    'food_id',
    'foodId',
    'donation_id',
    'donationId',
  );
  const restaurantId = payloadId(
    item.payload,
    'restaurant_id',
    'restaurantId',
  );

  if (role === 'RECEIVER') {
    // Meal / claim confirmation → claim history
    if (isClaimConfirmationType(item.type)) {
      navigation.navigate('History');
      return;
    }

    // New food nearby / expiring → food detail
    if (foodId && isNewFoodType(item.type)) {
      navigation.navigate('Home', {
        screen: 'FoodDetail',
        params: { foodId },
      });
      return;
    }

    if (restaurantId && item.type === 'RESTAURANT_UPDATE') {
      navigation.navigate('Home', {
        screen: 'RestaurantPage',
        params: { restaurantId },
      });
      return;
    }

    // Fallback: any notification that carries a food id opens food detail
    if (foodId) {
      navigation.navigate('Home', {
        screen: 'FoodDetail',
        params: { foodId },
      });
    }
    return;
  }

  if (role === 'RESTAURANT') {
    if (
      item.type === 'FOOD_CLAIMED' ||
      isClaimConfirmationType(item.type) ||
      foodId
    ) {
      navigation.navigate('Profile', { screen: 'TodaysClaims' });
    }
  }
}

function getIconConfig(type: string): IconConfig {
  switch (type) {
    case 'CLAIM_CONFIRMED':
    case 'MEAL_CLAIMED':
    case 'CLAIM_COLLECTED':
    case 'CLAIM_SUCCESS':
      return { name: 'checkmark-circle',   color: colors.successGreen,  bg: colors.successGreenLight };
    case 'NEW_FOOD_NEARBY':
    case 'FOOD_CLAIMED':
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

const NotifRow = memo(function NotifRow({
  item,
  onPress,
}: {
  item: AppNotification;
  onPress: (item: AppNotification) => void;
}) {
  const icon   = getIconConfig(item.type);
  const isRead = item.readAt !== null;
  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.75}
      onPress={() => onPress(item)}
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
  const role = useAuthStore((s) => s.user?.role);
  const {
    groups, unreadCount, page, hasNext,
    setInbox, appendInbox, setUnreadCount,
    markRead: storeMarkRead, markAllRead: storeMarkAllRead,
  } = useNotificationStore();

  const itemCount = useMemo(
    () => groups.reduce((sum, g) => sum + g.items.length, 0),
    [groups],
  );

  const [loading, setLoading]         = useState(itemCount === 0);
  const [refreshing, setRefreshing]   = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingMoreRef = useRef(false);

  const loadPage = useCallback(
    (pageNum: number, mode: 'replace' | 'append') => {
      return getNotifications({ page: pageNum, pageSize: 20 })
        .then((inbox) => {
          if (mode === 'replace') setInbox(inbox);
          else appendInbox(inbox);
        })
        .catch(() => {});
    },
    [setInbox, appendInbox],
  );

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadPage(1, 'replace').finally(() => setLoading(false));
    }, [loadPage]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPage(1, 'replace').finally(() => setRefreshing(false));
  }, [loadPage]);

  const onEndReached = useCallback(() => {
    if (!hasNext || loadingMoreRef.current || loading || refreshing) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    loadPage(page + 1, 'append').finally(() => {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    });
  }, [hasNext, loading, refreshing, page, loadPage]);

  const handleTap = useCallback((item: AppNotification) => {
    if (item.readAt === null) {
      storeMarkRead(item.id);
      apiMarkRead(item.id).then(() => getUnreadCount().then(setUnreadCount));
    }
    navigateFromNotification(navigation, item, role);
  }, [storeMarkRead, setUnreadCount, navigation, role]);

  const handleMarkAll = useCallback(() => {
    storeMarkAllRead();
    apiMarkAllRead().then(() => setUnreadCount(0));
  }, [storeMarkAllRead, setUnreadCount]);

  const sections = useMemo<Section[]>(
    () =>
      groups.map((g) => ({
        key: g.key,
        title: g.label,
        data: g.items,
      })),
    [groups],
  );

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

  if (itemCount === 0) {
    const listFailed = unreadCount > 0;
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
            <Ionicons
              name={listFailed ? 'refresh' : 'notifications'}
              size={48}
              color={colors.textMuted}
            />
          </View>
          <Text style={styles.emptyTitle}>
            {listFailed ? 'Couldn’t load notifications' : 'All caught up'}
          </Text>
          <Text style={styles.emptyDesc}>
            {listFailed
              ? 'You have unread alerts, but the list failed to load. Pull to refresh or try again.'
              : 'When new food appears nearby or someone claims your donation, you\'ll see it here.'}
          </Text>
          <TouchableOpacity
            style={styles.emptyCta}
            activeOpacity={0.85}
            onPress={() => {
              if (listFailed) {
                setLoading(true);
                loadPage(1, 'replace').finally(() => setLoading(false));
                return;
              }
              navigation.navigate('Home' as never);
            }}
          >
            <Text style={styles.emptyCtaText}>{listFailed ? 'Try again' : 'Browse food'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore
            ? <ActivityIndicator style={styles.footerLoader} color={colors.accentPrimary} />
            : null
        }
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accentPrimary}
            colors={[colors.accentPrimary]}
          />
        )}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
  },
  pageTitle: {
    fontSize: fontSizes['2xl'],
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    paddingTop: 4,
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 16,
  },

  sectionHeader: {
    fontSize: fontSizes['12'],
    fontFamily: fontFamilies.medium,
    color: colors.textMuted,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: spacing['4xl'],
  },
  footerLoader: {
    paddingVertical: spacing.xl,
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
    fontFamily: fontFamilies.semiBold,
    letterSpacing: -0.21,
    color: colors.textPrimary,
  },
  rowTitleRead: {
    fontFamily: fontFamilies.regular,
  },
  rowTime: {
    fontSize: fontSizes['12'],
    fontFamily: fontFamilies.medium,
    color: colors.textMuted,
    flexShrink: 0,
    marginTop: 2,
  },
  rowDesc: {
    fontSize: fontSizes['12'],
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
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.subheading,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyDesc: {
    fontSize: fontSizes['14'],
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
    fontFamily: fontFamilies.bold,
    letterSpacing: letterSpacings.button,
    color: colors.textInverse,
  },
});
