import type * as GeoJSON from 'geojson';

export interface Village {
  id: string;
  name: string;
  nameHindi: string;
  district: string;
  state: string;
  coordinates: [number, number]; // [lat, lng]
  boundary: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
  area: number; // km²
  /** Source of this result: 'local' = backend GeoJSON, 'nominatim' = OpenStreetMap search */
  source?: 'local' | 'nominatim';
  /** OSM place_id for Nominatim results */
  osm_id?: number;
}

export interface EnvironmentalMetrics {
  villageId: string;
  year: number;
  ndvi: number;              // -1 to 1
  ndwi: number;              // -1 to 1
  waterAreaHa: number;       // hectares
  greenCoverPercent: number; // 0-100
  landCover: LandCoverBreakdown;
  temperature: number;       // celsius
  rainfall: number;          // mm annual
  humidity: number;          // percent
  windSpeed: number;         // km/h
  dataSource: 'live' | 'cached' | 'mock' | 'incomplete';
}

export interface LandCoverBreakdown {
  cropland: number;      // percent
  trees: number;
  water: number;
  builtArea: number;
  grassland: number;
  bareLand: number;
  flooded: number;
}

export interface VillageHealthScore {
  villageId: string;
  year: number;
  overall: number;           // 0-100
  water: ScoreDetail;
  vegetation: ScoreDetail;
  climate: ScoreDetail;
  flood: ScoreDetail;
  land: ScoreDetail;
}

export interface ScoreDetail {
  score: number;             // 0-100
  explanation: string;
  trend: 'improving' | 'stable' | 'declining';
  trendValue: number;        // delta from previous year
}

export interface AIRecommendation {
  priority: 1 | 2 | 3;
  category: 'water' | 'vegetation' | 'climate' | 'flood' | 'land';
  title: string;
  description: string;
  scheme?: string;           // e.g. "MGNREGA", "PMKSY"
  expectedImpact: string;
  timeframe: string;
  costEstimate?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface HistoricalData {
  villageId: string;
  years: number[];
  metrics: EnvironmentalMetrics[];
  scores: VillageHealthScore[];
}

export interface ChangeMetric {
  year: number;
  value?: number;
  value_ha?: number;
  value_percent?: number;
  overall?: number;
  delta?: number;
  delta_from_previous?: number;
  delta_ha?: number;
  delta_percent?: number;
}

export interface TopChange {
  type: string;
  magnitude: number;
  direction: 'improving' | 'stable' | 'declining';
  description: string;
}

export interface ChangeStatistics {
  ndvi_changes: ChangeMetric[];
  water_area_changes: ChangeMetric[];
  green_cover_changes: ChangeMetric[];
  score_changes: ChangeMetric[];
  best_year: number;
  worst_year: number;
  overall_trend: 'improving' | 'stable' | 'declining';
  top_changes: TopChange[];
}

export interface GEEStatus {
  loading: boolean;
  cached: boolean;
  estimatedSeconds?: number;
  error?: string;
}
