import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexTooltip,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { PieReportResponse } from '../../../models/report-response.model';

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-pie-chart',
  imports: [NgApexchartsModule],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss',
})
export class PieChartComponent implements OnChanges {
  @Input() report: PieReportResponse | null = null;

  public chartOptions: Partial<PieChartOptions> = {};
  public hasData = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['report']) {
      this.setChartOptions();
    }
  }

  private setChartOptions(): void {
    if (
      !this.report ||
      !this.report.series.length ||
      !this.report.labels.length
    ) {
      this.chartOptions = {};
      this.hasData = false;
      return;
    }

    this.hasData = true;

    this.chartOptions = {
      series: this.report.series,
      chart: {
        width: 380,
        type: 'pie',
      },
      labels: this.report.labels,
      dataLabels: {
        enabled: true,
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: 'bottom',
      },
      tooltip: {
        y: {
          formatter: (value: number) => `${value}`,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 300,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  }
}
