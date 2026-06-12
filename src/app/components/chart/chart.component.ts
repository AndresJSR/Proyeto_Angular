import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexStroke,
  ApexFill,
  ApexLegend,
  ApexTooltip,
  ApexMarkers,
  ApexPlotOptions,
  ApexResponsive,
  ApexGrid,
  ApexAnnotations,
  ApexStates,
  ApexTheme,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { ReportsService } from '../../services/reports.service';
import {
  ReportAxisSeries,
  ReportResponse,
} from '../../models/report-response.model';

export type ChartOptions = {
  series?: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart?: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  title?: ApexTitleSubtitle;
  subtitle?: ApexTitleSubtitle;
  dataLabels?: ApexDataLabels;
  stroke?: ApexStroke;
  fill?: ApexFill;
  legend?: ApexLegend;
  tooltip?: ApexTooltip;
  markers?: ApexMarkers;
  plotOptions?: ApexPlotOptions;
  responsive?: ApexResponsive[];
  grid?: ApexGrid;
  annotations?: ApexAnnotations;
  states?: ApexStates;
  theme?: ApexTheme;
  colors?: string[];
  labels?: any;
};

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './chart.component.html',
})
export class AppChart {
  public chartOptions: Partial<ChartOptions> = {};

  query = '';
  loading = false;
  error: string | null = null;
  hasReport = false;

  constructor(private reportsService: ReportsService) {}

  generateReport(): void {
    const cleanQuery = this.query.trim();

    if (!cleanQuery) {
      this.error = 'Debes escribir una consulta para generar el reporte.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.hasReport = false;

    this.reportsService.generateReport(cleanQuery).subscribe({
      next: (response) => {
        this.loading = false;
        this.buildBarChart(response, cleanQuery);
      },
      error: (error) => {
        this.loading = false;
        this.error =
          'No fue posible generar el reporte. Intenta con otra consulta.';
        console.error('Error al consumir /reports:', error);
      },
    });
  }

  private buildBarChart(response: ReportResponse, query: string): void {
    const labels = response.labels ?? [];
    const series = this.normalizeSeries(response);

    if (!labels.length || !series.length) {
      this.error = 'La consulta no retornó datos para graficar.';
      this.hasReport = false;
      return;
    }

    this.chartOptions = {
      series,
      chart: {
        type: 'bar',
        height: 350,
      },
      title: {
        text: 'Reporte generado',
        align: 'left',
      },
      subtitle: {
        text: query,
        align: 'left',
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: 'end',
          horizontal: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: labels,
      },
      yaxis: {
        title: {
          text: 'Categorías',
        },
      },
      tooltip: {
        enabled: true,
      },
      legend: {
        show: true,
      },
      grid: {
        show: true,
      },
    };

    this.hasReport = true;
  }

  private normalizeSeries(response: ReportResponse): ApexAxisChartSeries {
    if (!Array.isArray(response.series)) {
      return [];
    }

    const firstItem = response.series[0];

    if (
      typeof firstItem === 'object' &&
      firstItem !== null &&
      'data' in firstItem
    ) {
      return response.series as ReportAxisSeries[];
    }

    return [
      {
        name: 'Cantidad',
        data: response.series as number[],
      },
    ];
  }
}
