from pydantic import BaseModel
from typing import Tuple, List, Any, Dict, Literal


class Village(BaseModel):
    id: str
    name: str
    nameHindi: str
    district: str
    state: str
    coordinates: Tuple[float, float]
    boundary: Dict[str, Any]
    area: float


class LandCoverBreakdown(BaseModel):
    cropland: float
    trees: float
    water: float
    builtArea: float
    grassland: float
    bareLand: float
    flooded: float


class EnvironmentalMetrics(BaseModel):
    villageId: str
    year: int
    ndvi: float
    ndwi: float
    waterAreaHa: float
    greenCoverPercent: float
    landCover: LandCoverBreakdown
    temperature: float
    rainfall: float
    humidity: float
    windSpeed: float
    dataSource: Literal['live', 'cached', 'mock', 'incomplete']


class ScoreDetail(BaseModel):
    score: float
    explanation: str
    trend: Literal['improving', 'stable', 'declining']
    trendValue: float


class VillageHealthScore(BaseModel):
    villageId: str
    year: int
    overall: float
    water: ScoreDetail
    vegetation: ScoreDetail
    climate: ScoreDetail
    flood: ScoreDetail
    land: ScoreDetail


class AIRecommendation(BaseModel):
    priority: Literal[1, 2, 3]
    category: Literal['water', 'vegetation', 'climate', 'flood', 'land']
    title: str
    description: str
    scheme: str | None = None
    expectedImpact: str
    timeframe: str
    costEstimate: str | None = None
    urgency: Literal['low', 'medium', 'high', 'critical']


class HistoricalData(BaseModel):
    villageId: str
    years: List[int]
    metrics: List[EnvironmentalMetrics]
    scores: List[VillageHealthScore]


class GEEStatus(BaseModel):
    loading: bool
    cached: bool
    estimatedSeconds: int | None = None
    error: str | None = None
