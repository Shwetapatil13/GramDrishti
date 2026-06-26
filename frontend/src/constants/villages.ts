import { Village } from '@/types';

// NOTE: boundaries are intentionally null here.
// Real polygon boundaries are fetched from the backend (/api/v1/villages/:id)
// which loads actual GeoJSON from the maharashtra.geojson dataset.
// Do NOT put hardcoded bounding rectangles here — they cause the blue box bug.
export const VILLAGES: Village[] = [
  {
    id: 'mulshi',
    name: 'Mulshi',
    nameHindi: 'मुळशी',
    district: 'Pune',
    state: 'Maharashtra',
    coordinates: [18.5204, 73.5297],
    boundary: null,
    area: 50.5,
  },
  {
    id: 'maval',
    name: 'Maval',
    nameHindi: 'मावळ',
    district: 'Pune',
    state: 'Maharashtra',
    coordinates: [18.7667, 73.5833],
    boundary: null,
    area: 60.2,
  },
  {
    id: 'ambegaon',
    name: 'Ambegaon',
    nameHindi: 'आंबेगाव',
    district: 'Pune',
    state: 'Maharashtra',
    coordinates: [19.1167, 73.7167],
    boundary: null,
    area: 45.3,
  },
  {
    id: 'khed',
    name: 'Khed',
    nameHindi: 'खेड',
    district: 'Pune',
    state: 'Maharashtra',
    coordinates: [18.8333, 73.8667],
    boundary: null,
    area: 55.0,
  },
  {
    id: 'junnar',
    name: 'Junnar',
    nameHindi: 'जुन्नर',
    district: 'Pune',
    state: 'Maharashtra',
    coordinates: [19.2000, 73.8833],
    boundary: null,
    area: 70.1,
  },
];