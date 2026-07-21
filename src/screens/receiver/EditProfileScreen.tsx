import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import ImageWithSkeleton from '../../components/ImageWithSkeleton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ProfileStackParamList } from '../../navigation/ReceiverTabs';
import { useProfileStore } from '../../store/profileStore';
import { api } from '../../services/api';
import {
  colors, spacing, fontSizes, fontFamilies, radius,
} from '../../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;
};

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function EditProfileScreen({ navigation }: Props) {
  const { photoUrl, displayName, setProfile } = useProfileStore();
  const [pendingUri, setPendingUri] = useState<string | null>(photoUrl);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPendingUri(result.assets[0].uri);
    }
  }, []);

  const handleGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPendingUri(result.assets[0].uri);
    }
  }, []);

  const handleRemove = useCallback(() => {
    setPendingUri(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    setSaveError('');
    try {
      if (pendingUri === null) {
        // User removed photo — send JSON
        const res = await api.patch('/receiver/profile/', { remove_photo: true });
        setProfile({ photoUrl: res.data.data.photo_url ?? null });
      } else if (!pendingUri.startsWith('http')) {
        // New local file — send multipart
        const filename = pendingUri.split('/').pop() ?? 'photo.jpg';
        const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpeg';
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
        const formData = new FormData();
        formData.append('photo', { uri: pendingUri, name: filename, type: mimeType } as unknown as Blob);
        const res = await api.patch('/receiver/profile/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setProfile({ photoUrl: res.data.data.photo_url ?? null });
      }
      // No change (same remote URL) — skip API call
      navigation.goBack();
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Could not save photo. Try again.');
      setSaving(false);
    }
  }, [saving, pendingUri, setProfile, navigation]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.heroText}>
          <Text style={styles.eyebrow}>Make it yours</Text>
          <Text style={styles.title}>Profile picture</Text>
          <Text style={styles.desc}>
            Restaurants see this photo when you collect your meal.
          </Text>
        </View>

        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            {pendingUri ? (
              <ImageWithSkeleton
                source={{ uri: pendingUri }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>{initials(displayName || 'U')}</Text>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Change photo</Text>

        <View style={styles.actionCard}>
          <TouchableOpacity style={styles.actionRow} onPress={handleCamera} activeOpacity={0.6}>
            <View style={[styles.actionIcon, { backgroundColor: colors.avatarBg }]}>
              <Ionicons name="camera" size={18} color={colors.accentPrimary} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Take a photo</Text>
              <Text style={styles.actionSub}>Use your camera</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={handleGallery} activeOpacity={0.6}>
            <View style={[styles.actionIcon, { backgroundColor: colors.goldLight }]}>
              <Ionicons name="images" size={18} color={colors.goldDark} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Choose from gallery</Text>
              <Text style={styles.actionSub}>Pick an existing photo</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={handleRemove} activeOpacity={0.6}>
            <View style={[styles.actionIcon, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="trash" size={18} color={colors.dangerRed} />
            </View>
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, styles.actionTitleDanger]}>Remove photo</Text>
              <Text style={styles.actionSub}>Use your initials instead</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.helperNote}>
          A clear face photo helps restaurant staff recognise you at pickup.
        </Text>

        {!!saveError && (
          <Text style={styles.saveError}>{saveError}</Text>
        )}

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color={colors.textInverse} />
              <Text style={styles.saveBtnLabel}>Save changes</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelBtnLabel}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
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

  heroText: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: 28,
  },

  eyebrow: {
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: 6,
  },

  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['2xl'],
    letterSpacing: -0.6,
    color: colors.textPrimary,
  },

  desc: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['14'],
    lineHeight: 21,
    color: colors.textMuted,
    marginTop: 8,
  },

  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 28,
  },

  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  avatarImage: {
    width: 120,
    height: 120,
  },

  avatarText: {
    fontSize: fontSizes['2xl'],
    fontFamily: fontFamilies.bold,
    letterSpacing: 0.4,
    color: colors.accentPrimary,
  },

  sectionTitle: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.lg,
    letterSpacing: -0.425,
    color: colors.textPrimary,
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.md,
  },

  actionCard: {
    marginHorizontal: spacing['2xl'],
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: spacing.lg,
  },

  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  actionText: { flex: 1 },

  actionTitle: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes['14'],
    letterSpacing: -0.21,
    color: colors.textPrimary,
  },

  actionTitleDanger: {
    color: colors.dangerRed,
  },

  actionSub: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.textMuted,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: colors.borderDefault,
  },

  helperNote: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: 'center',
    paddingTop: 14,
    paddingHorizontal: spacing['2xl'],
    marginBottom: 4,
  },

  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    height: 54,
    borderRadius: radius.card,
    marginTop: 28,
    marginHorizontal: spacing['2xl'],
    gap: 8,
  },

  saveBtnLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    letterSpacing: 0.28,
    color: colors.textInverse,
  },

  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: radius.card,
    marginTop: 10,
    marginHorizontal: spacing['2xl'],
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: colors.borderDefault,
  },

  cancelBtnLabel: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes['14'],
    letterSpacing: 0.28,
    color: colors.textPrimary,
  },

  saveBtnDisabled: { opacity: 0.6 },

  saveError: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes['12'],
    color: colors.dangerRed,
    textAlign: 'center',
    paddingHorizontal: spacing['2xl'],
    marginTop: spacing.lg,
  },
});
