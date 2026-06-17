import { Injectable } from '@angular/core';

import {
  BarReportResponse,
  LineReportResponse,
  ReportResponse,
} from '../models/report-response.model';

import {
  ReportStats,
  ReportTechnicalStats,
  ReportUserStats,
} from '../models/report-stats.model';

@Injectable({
  providedIn: 'root',
})
export class ReportStatsCalculatorService {
  buildStats(report: ReportResponse | null): ReportStats {
    if (!report) {
      return this.getEmptyStats();
    }

    return {
      user: this.buildUserStats(report),
      technical: this.buildTechnicalStats(report),
    };
  }

  private buildUserStats(report: ReportResponse): ReportUserStats {
    const values = this.getAllValues(report);

    if (!values.length) {
      return this.getEmptyUserStats();
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    const average = total / values.length;
    const maxValue = Math.max(...values);
    const mainGroup = this.getMainGroup(report);

    return {
      total,
      average,
      maxValue,
      mainGroup,
    };
  }

  private buildTechnicalStats(report: ReportResponse): ReportTechnicalStats {
    if (report.type === 'pie') {
      return {
        chartType: report.type,
        totalSeries: 1,
        totalGroups: report.labels.length,
        totalDataPoints: report.series.length,
      };
    }

    return {
      chartType: report.type,
      totalSeries: report.series.length,
      totalGroups: report.labels?.length ?? 0,
      totalDataPoints: report.series.reduce(
        (total, serie) => total + serie.data.length,
        0,
      ),
    };
  }

  private getAllValues(report: ReportResponse): number[] {
    if (report.type === 'pie') {
      return report.series.filter((value) => this.isValidNumber(value));
    }

    return report.series.flatMap((serie) =>
      serie.data.filter((value) => this.isValidNumber(value)),
    );
  }

  private getMainGroup(report: ReportResponse): string {
    if (report.type === 'pie') {
      return this.getMainGroupFromPie(report);
    }

    return this.getMainGroupFromAxisChart(report);
  }

  private getMainGroupFromPie(report: ReportResponse): string {
    if (report.type !== 'pie') {
      return 'Sin datos';
    }

    let maxIndex = 0;
    let maxValue = Number.NEGATIVE_INFINITY;

    report.series.forEach((value, index) => {
      if (value > maxValue) {
        maxValue = value;
        maxIndex = index;
      }
    });

    return report.labels[maxIndex] ?? 'Sin grupo';
  }

  private getMainGroupFromAxisChart(
    report: BarReportResponse | LineReportResponse,
  ): string {
    const labels = this.getAxisLabels(report);

    if (!labels.length) {
      return 'Sin datos';
    }

    const totalsByGroup = labels.map((label, index) => {
      const total = report.series.reduce(
        (sum, serie) => sum + this.getSafeNumber(serie.data[index]),
        0,
      );

      return {
        label,
        total,
      };
    });

    const mainGroup = totalsByGroup.reduce((highest, current) =>
      current.total > highest.total ? current : highest,
    );

    return mainGroup.label;
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
    return this.isValidNumber(value) ? value : 0;
  }

  private isValidNumber(value: unknown): value is number {
    return typeof value === 'number' && !Number.isNaN(value);
  }

  private getEmptyStats(): ReportStats {
    return {
      user: this.getEmptyUserStats(),
      technical: this.getEmptyTechnicalStats(),
    };
  }

  private getEmptyUserStats(): ReportUserStats {
    return {
      total: 0,
      average: 0,
      maxValue: 0,
      mainGroup: 'Sin datos',
    };
  }

  private getEmptyTechnicalStats(): ReportTechnicalStats {
    return {
      chartType: null,
      totalSeries: 0,
      totalGroups: 0,
      totalDataPoints: 0,
    };
  }
}
