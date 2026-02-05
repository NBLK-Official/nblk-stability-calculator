export interface Indicator {
  id: string;
  name: string;
  description: string;
  weight: number;
  grade: string;
  score: number;
  color?: string;
}

export interface Demographics {
  ageRange?: string;
  region?: string;
}

export interface RegionAverage {
  region: string;
  avg_composite_score: number;
}

export interface AgeRangeAverage {
  age_range: string;
  avg_composite_score: number;
}

export interface CommunityAverages {
  overall: number;
  by_region: RegionAverage[];
  by_age_range: AgeRangeAverage[];
}

export interface UserResult {
  composite_score: number;
  grade: string;
  stability_status: string;
}

export interface ApiResponse {
  userResult: UserResult;
  averages: CommunityAverages;
}

export interface Results {
  compositeScore: number;
  grade: string;
  stabilityStatus: string;
  label: string;
  indicators: Indicator[];
  communityAverages?: CommunityAverages;
  surveyId?: string;
}

export interface EvaluationState {
  demographics: Demographics;
} 