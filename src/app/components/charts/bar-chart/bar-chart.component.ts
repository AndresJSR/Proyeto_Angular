import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { BarReportResponse } from '../../../models/report-response.model';

@Component({
  selector: 'app-bar-chart',
  imports: [NgApexchartsModule],
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent implements OnChanges {
  @Input() report: BarReportResponse | null = null;

  public chartOptions: any = {};
  public hasData = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['report']) this.buildChart();
  }

  private buildChart(): void {
    if (!this.report?.series?.length) { this.hasData = false; return; }
    this.hasData = this.report.series.some(s => s.data.length > 0);
    if (!this.hasData) return;

    const categories  = this.report.labels?.length
      ? this.report.labels
      : this.report.series[0].data.map((_, i) => `Item ${i + 1}`);
    const isHorizontal = categories.length > 6;

    this.chartOptions = {
      series: this.report.series,
      chart: {
        type: 'bar',
        height: isHorizontal ? 420 : 340,
        toolbar: { show: false },
        fontFamily: 'inherit',
        animations: { enabled: true, easing: 'easeinout', speed: 500 },
      },
      colors: ['#3b82f6'],
      plotOptions: {
        bar: {
          horizontal: isHorizontal,
          columnWidth: '48%',
          barHeight: '55%',
          borderRadius: 6,
          borderRadiusApplication: 'end',
          distributed: false,
        },
      },
      dataLabels: { enabled: false },
      fill: { opacity: 1 },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { fontSize: '12px', fontWeight: 500, colors: '#94a3b8' },
          trim: true,
          maxHeight: 72,
        },
      },
      yaxis: {
        labels: {
          style: { fontSize: '12px', colors: '#94a3b8' },
        },
      },
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 3,
        xaxis: { lines: { show: isHorizontal } },
        yaxis: { lines: { show: !isHorizontal } },
        padding: { top: 4, right: 8, bottom: 0, left: 8 },
      },
      legend: { show: false },
      tooltip: {
        theme: 'light',
        style: { fontSize: '13px' },
        y: { formatter: (v: number) => `${v} anotaciones` },
      },
      responsive: [{
        breakpoint: 768,
        options: {
          chart: { height: 300 },
          plotOptions: { bar: { horizontal: true } },
        },
      }],
    };
  }
}
