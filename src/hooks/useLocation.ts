import { useState, useEffect } from 'react';
import { requestForegroundPermissionsAsync, getLastKnownPositionAsync, getCurrentPositionAsync, Accuracy } from 'expo-location';

interface LocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
}

export function useLocation(): LocationState {
  const [state, setState] = useState<LocationState>({ lat: null, lng: null, loading: true });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { status } = await requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) setState({ lat: null, lng: null, loading: false });
          return;
        }
        const last = await getLastKnownPositionAsync();
        if (last && !cancelled) {
          setState({ lat: last.coords.latitude, lng: last.coords.longitude, loading: false });
          return;
        }
        const pos = await getCurrentPositionAsync({
          accuracy: Accuracy.Balanced,
        });
        if (!cancelled) {
          setState({ lat: pos.coords.latitude, lng: pos.coords.longitude, loading: false });
        }
      } catch {
        if (!cancelled) setState({ lat: null, lng: null, loading: false });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return state;
}
