import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexResponsive,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { LineReportResponse } from '../../../models/report-response.model';

export type LineChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  markers: ApexMarkers;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  grid: ApexGrid;
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-line-chart',
  imports: [NgApexchartsModule],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss',
})
export class LineChartComponent implements OnChanges {
  @Input() report: LineReportResponse | null = null;

  public chartOptions: Partial<LineChartOptions> = {};
  public hasData = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['report']) {
      this.setChartOptions();
    }
  }

  private setChartOptions(): void {
    if (!this.report || !this.report.series.length) {
      this.chartOptions = {};
      this.hasData = false;
      return;
    }

    this.hasData = this.report.series.some((serie) => serie.data.length > 0);

    if (!this.hasData) {
      this.chartOptions = {};
      return;
    }

    this.chartOptions = {
      series: this.report.series,
      chart: {
        height: 380,
        type: 'line',
        toolbar: {
          show: true,
        },
        zoom: {
          enabled: false,
        },
      },
      xaxis: {
        categories: this.getCategories(),
      },
      yaxis: {
        title: {
          text: 'Valor',
        },
      },
      dataLabels: {
        enabled: true,
      },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      markers: {
        size: 4,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
      },
      tooltip: {
        y: {
          formatter: (value: number) => `${value}`,
        },
      },
      grid: {
        borderColor: '#e5e7eb',
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 340,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  }

  private getCategories(): string[] {
    if (this.report?.labels?.length) {
      return this.report.labels;
    }

    const totalDataPoints = Math.max(
      ...(this.report?.series.map((serie) => serie.data.length) ?? [0]),
    );

    return Array.from(
      { length: totalDataPoints },
      (_, index) => `Dato ${index + 1}`,
    );
  }
}
