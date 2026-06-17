import { ReportChartType } from './report-response.model';

export type ReportStatsViewMode = 'user' | 'technical';

export interface ReportUserStats {
  total: number;
  average: number;
  maxValue: number;
  mainGroup: string;
}

export interface ReportTechnicalStats {
  chartType: ReportChartType | null;
  totalSeries: number;
  totalGroups: number;
  totalDataPoints: number;
}

export interface ReportStats {
  user: ReportUserStats;
  technical: ReportTechnicalStats;
}
