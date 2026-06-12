export type ReportChartType = 'bar' | 'pie' | 'line';

export interface ReportAxisSeries {
  name: string;
  data: number[];
}

export interface ReportResponse {
  type: ReportChartType | string;
  labels: string[];
  series: ReportAxisSeries[] | number[];
}

export interface ReportRequest {
  query: string;
}
