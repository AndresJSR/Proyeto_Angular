import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexResponsive,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { BarReportResponse } from '../../../models/report-response.model';

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  grid: ApexGrid;
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-bar-chart',
  imports: [NgApexchartsModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent implements OnChanges {
  @Input() report: BarReportResponse | null = null;

  public chartOptions: Partial<BarChartOptions> = {};
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

    const categories = this.getCategories();
    const isHorizontal = categories.length > 6;

    this.chartOptions = {
      series: this.report.series,
      chart: {
        type: 'bar',
        height: isHorizontal ? 460 : 380,
        toolbar: {
          show: true,
        },
      },
      xaxis: {
        categories,
      },
      yaxis: {
        title: {
          text: 'Valor',
        },
      },
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        bar: {
          horizontal: isHorizontal,
          columnWidth: '45%',
          borderRadius: 4,
        },
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
              height: 360,
            },
            plotOptions: {
              bar: {
                horizontal: true,
              },
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
