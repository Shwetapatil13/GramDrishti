from pydantic import BaseModel, Field
from typing import Literal, Optional

class AIRecommendationModel(BaseModel):
    priority: Literal[1, 2, 3] = Field(description="Priority of the recommendation")
    category: Literal['water', 'vegetation', 'climate', 'flood', 'land'] = Field(description="Category of the recommendation")
    title: str = Field(description="Short title of the recommendation")
    description: str = Field(description="Detailed description")
    scheme: Optional[str] = Field(default=None, description="Relevant government scheme")
    expectedImpact: str = Field(alias="expected_impact", description="Expected impact of the recommendation")
    timeframe: str = Field(description="Timeframe for implementation")
    costEstimate: Optional[str] = Field(alias="cost_estimate", default=None, description="Estimated cost")
    urgency: Literal['low', 'medium', 'high', 'critical'] = Field(description="Urgency level")

    class Config:
        populate_by_name = True