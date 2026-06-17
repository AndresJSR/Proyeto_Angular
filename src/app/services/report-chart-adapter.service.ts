import { Injectable } from '@angular/core';

import {
  BarReportResponse,
  LineReportResponse,
  PieReportResponse,
  ReportChartType,
  ReportResponse,
  ReportSeriesItem,
} from '../models/report-response.model';

@Injectable({
  providedIn: 'root',
})
export class ReportChartAdapterService {
  adapt(report: ReportResponse, targetType: ReportChartType): ReportResponse {
    if (report.type === targetType) {
      return report;
    }

    if (targetType === 'pie') {
      return this.toPie(report);
    }

    if (targetType === 'bar') {
      return this.toBar(report);
    }

    return this.toLine(report);
  }

  toPie(report: ReportResponse): PieReportResponse {
    if (report.type === 'pie') {
      return report;
    }

    const labels = this.getAxisLabels(report);
    const series = labels.map((_, index) =>
      report.series.reduce(
        (total, serie) => total + this.getSafeNumber(serie.data[index]),
        0,
      ),
    );

    return {
      type: 'pie',
      title: report.title,
      subtitle: report.subtitle,
      message: report.message,
      labels,
      series,
    };
  }

  toBar(report: ReportResponse): BarReportResponse {
    if (report.type === 'bar') {
      return report;
    }

    return {
      type: 'bar',
      title: report.title,
      subtitle: report.subtitle,
      message: report.message,
      labels: this.getLabels(report),
      series: this.getSeries(report),
    };
  }

  toLine(report: ReportResponse): LineReportResponse {
    if (report.type === 'line') {
      return report;
    }

    return {
      type: 'line',
      title: report.title,
      subtitle: report.subtitle,
      message: report.message,
      labels: this.getLabels(report),
      series: this.getSeries(report),
    };
  }

  private getLabels(report: ReportResponse): string[] {
    if (report.type === 'pie') {
      return report.labels;
    }

    return this.getAxisLabels(report);
  }

  private getSeries(report: ReportResponse): ReportSeriesItem[] {
    if (report.type === 'bar' || report.type === 'line') {
      return report.series;
    }

    return [
      {
        name: report.title ?? 'Valores',
        data: report.series,
      },
    ];
  }

  private getAxisLabels(
    report: BarReportResponse | LineReportResponse,
  ): string[] {
    if (report.labels?.length) {
      return report.labels;
    }

    const totalDataPoints = Math.max(
      ...report.series.map((serie) => serie.data.length),
    );

    return Array.from(
      { length: totalDataPoints },
      (_, index) => `Dato ${index + 1}`,
    );
  }

  private getSafeNumber(value: number | undefined): number {
    return typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  }
}
