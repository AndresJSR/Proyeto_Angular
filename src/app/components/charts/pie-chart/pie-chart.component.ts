import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PieReportResponse } from '../../../models/report-response.model';

@Component({
  selector: 'app-pie-chart',
  imports: [NgApexchartsModule],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss',
})
export class PieChartComponent implements OnChanges {
  @Input() report: PieReportResponse | null = null;

  public chartOptions: any = {};
  public hasData = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['report']) this.buildChart();
  }

  private buildChart(): void {
    if (!this.report?.series?.length || !this.report?.labels?.length) {
      this.hasData = false;
      return;
    }
    this.hasData = true;

    this.chartOptions = {
      series: this.report.series,
      chart: {
        type: 'donut',
        height: 320,
        toolbar: { show: false },
        fontFamily: 'inherit',
        animations: { enabled: true, easing: 'easeinout', speed: 500 },
      },
      colors: ['#3b82f6', '#64748b', '#0ea5e9', '#94a3b8', '#1d4ed8', '#475569'],
      labels: this.report.labels,
      stroke: { width: 2, colors: ['#ffffff'] },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '13px',
                fontWeight: 600,
                color: '#64748b',
                offsetY: -8,
              },
              value: {
                show: true,
                fontSize: '26px',
                fontWeight: 700,
                color: '#0f172a',
                offsetY: 6,
                formatter: (val: string) => val,
              },
              total: {
                show: true,
                label: 'Total',
                fontSize: '13px',
                fontWeight: 600,
                color: '#94a3b8',
                formatter: (w: any) =>
                  w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString(),
              },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '13px',
        fontWeight: 500,
        offsetY: 6,
        markers: { width: 8, height: 8, radius: 8 },
        itemMargin: { horizontal: 10, vertical: 4 },
        labels: { colors: '#64748b' },
      },
      tooltip: {
        theme: 'light',
        style: { fontSize: '13px' },
        y: { formatter: (v: number) => `${v} funcionarios` },
      },
      responsive: [{
        breakpoint: 480,
        options: { chart: { height: 280 } },
      }],
    };
  }
}
