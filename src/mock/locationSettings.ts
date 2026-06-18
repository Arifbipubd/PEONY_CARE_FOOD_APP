// Mock location settings — mirrors the backend location_settings API response.

import { ApiLocationSettings } from '../types/api';

export const MOCK_LOCATION_SETTINGS: ApiLocationSettings = {
  search_radius_km: 5,
  location_services_enabled: true,
  save_location_history: true,
  recent_places: [
    {
      id: 'place-001',
      name: 'Maxwell Food Centre',
      area: 'Tanjong Pagar',
      address: '1 Kadayanallur St',
      visited_at: '2026-06-16T12:00:00+08:00',
      icon_color: '#FCE4E4',
    },
    {
      id: 'place-002',
      name: 'Tian Tian Hainanese',
      area: 'Joo Chiat',
      address: '443 Joo Chiat Rd',
      visited_at: '2026-06-16T09:30:00+08:00',
      icon_color: '#FCE4E4',
    },
    {
      id: 'place-003',
      name: 'ION Orchard',
      area: 'Orchard',
      address: '2 Orchard Turn',
      visited_at: '2026-06-15T14:00:00+08:00',
      icon_color: '#FEF9E7',
    },
    {
      id: 'place-004',
      name: 'Bishan MRT Station',
      area: 'Bishan',
      address: '200 Bishan Rd',
      visited_at: '2026-06-14T08:15:00+08:00',
      icon_color: '#E8F0FE',
    },
    {
      id: 'place-005',
      name: 'Bishan-Ang Mo Kio Park',
      area: 'Bishan',
      address: '1380 Ang Mo Kio Ave 1',
      visited_at: '2026-06-14T16:45:00+08:00',
      icon_color: '#E6F4EA',
    },
    {
      id: 'place-006',
      name: 'Tampines Mall',
      area: 'Tampines',
      address: '4 Tampines Central 5',
      visited_at: '2026-06-13T11:00:00+08:00',
      icon_color: '#FEF9E7',
    },
    {
      id: 'place-007',
      name: 'VivoCity',
      area: 'HarbourFront',
      address: '1 HarbourFront Walk',
      visited_at: '2026-06-12T15:30:00+08:00',
      icon_color: '#FEF9E7',
    },
  ],
};
