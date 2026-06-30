import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

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
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) setState({ lat: null, lng: null, loading: false });
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
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
