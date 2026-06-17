import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import {
  ReportChartType,
  ReportResponse,
} from '../../models/report-response.model';
import {
  ReportStats,
  ReportStatsViewMode,
} from '../../models/report-stats.model';
import { ReportStatsCalculatorService } from '../../services/report-stats-calculator.service';

@Component({
  selector: 'app-report-stats',
  imports: [CommonModule],
  templateUrl: './report-stats.component.html',
  styleUrl: './report-stats.component.scss',
})
export class ReportStatsComponent implements OnChanges {
  @Input() report: ReportResponse | null = null;

  selectedView: ReportStatsViewMode = 'user';

  stats: ReportStats = this.statsCalculator.buildStats(null);

  constructor(private readonly statsCalculator: ReportStatsCalculatorService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['report']) {
      this.stats = this.statsCalculator.buildStats(this.report);
    }
  }

  selectView(view: ReportStatsViewMode): void {
    this.selectedView = view;
  }

  get chartTypeLabel(): string {
    if (!this.stats.technical.chartType) {
      return 'Sin reporte';
    }

    const labels: Record<ReportChartType, string> = {
      pie: 'Circular',
      bar: 'Barras',
      line: 'Líneas',
    };

    return labels[this.stats.technical.chartType];
  }
}
