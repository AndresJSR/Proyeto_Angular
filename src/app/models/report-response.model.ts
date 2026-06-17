export type ReportChartType = 'pie' | 'bar' | 'line';

export interface ReportRequest {
  query: string;
}

export interface ReportSeriesItem {
  name: string;
  data: number[];
}

export interface ReportBaseResponse {
  type: ReportChartType;
  title?: string;
  subtitle?: string;
  message?: string;
  labels?: string[];
}

export interface PieReportResponse extends ReportBaseResponse {
  type: 'pie';
  labels: string[];
  series: number[];
}

export interface BarReportResponse extends ReportBaseResponse {
  type: 'bar';
  series: ReportSeriesItem[];
}

export interface LineReportResponse extends ReportBaseResponse {
  type: 'line';
  series: ReportSeriesItem[];
}

export type ReportResponse =
  | PieReportResponse
  | BarReportResponse
  | LineReportResponse;

export interface ReportErrorResponse {
  statusCode?: number;
  message: string;
  error?: string;
}
