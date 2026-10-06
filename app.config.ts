import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'UDUFood',
  slug: config.slug ?? 'udufood',
  android: {
    ...config.android,
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
      },
    },
  },
  plugins: [
    ...(config.plugins ?? []),
    'expo-secure-store',
    'expo-sharing',
    'expo-status-bar',
  ],
});
