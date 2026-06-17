import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';

import {
  BarReportResponse,
  LineReportResponse,
  PieReportResponse,
  ReportChartType,
  ReportResponse,
} from '../../models/report-response.model';

import { ReportChartAdapterService } from '../../services/report-chart-adapter.service';
import { BarChartComponent } from '../charts/bar-chart/bar-chart.component';
import { LineChartComponent } from '../charts/line-chart/line-chart.component';
import { PieChartComponent } from '../charts/pie-chart/pie-chart.component';

@Component({
  selector: 'app-report-chart',
  imports: [PieChartComponent, BarChartComponent, LineChartComponent],
  templateUrl:  './report-chart.component.html',
  styleUrl: './report-chart.component.scss',
})
export class ReportChartComponent implements OnChanges {
  @Input() report: ReportResponse | null = null;

  @Output() displayedReportChange = new EventEmitter<ReportResponse | null>();

  selectedChartType: ReportChartType = 'bar';
  displayedReport: ReportResponse | null = null;

  readonly chartOptions: Array<{ value: ReportChartType; label: string }> = [
    { value: 'pie', label: 'Circular' },
    { value: 'bar', label: 'Barras' },
    { value: 'line', label: 'Líneas' },
  ];

  constructor(private readonly adapter: ReportChartAdapterService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['report']) {
      if (!this.report) {
        this.displayedReport = null;
        this.displayedReportChange.emit(null);
        return;
      }

      this.selectedChartType = this.report.type;
      this.updateDisplayedReport();
    }
  }

  selectChartType(type: ReportChartType): void {
    if (!this.report) {
      return;
    }

    this.selectedChartType = type;
    this.updateDisplayedReport();
  }

  get pieReport(): PieReportResponse | null {
    return this.displayedReport?.type === 'pie' ? this.displayedReport : null;
  }

  get barReport(): BarReportResponse | null {
    return this.displayedReport?.type === 'bar' ? this.displayedReport : null;
  }

  get lineReport(): LineReportResponse | null {
    return this.displayedReport?.type === 'line' ? this.displayedReport : null;
  }

  get chartTypeLabel(): string {
    if (!this.displayedReport) {
      return 'Sin reporte';
    }

    const labels: Record<ReportChartType, string> = {
      pie: 'Gráfica circular',
      bar: 'Gráfica de barras',
      line: 'Gráfica de líneas',
    };

    return labels[this.displayedReport.type];
  }

  get chartDescription(): string {
    if (!this.displayedReport) {
      return 'Realiza una consulta para generar una visualización.';
    }

    return 'La misma respuesta del reporte se está representando en el tipo de gráfica seleccionado.';
  }

  private updateDisplayedReport(): void {
    if (!this.report) {
      this.displayedReport = null;
      this.displayedReportChange.emit(null);
      return;
    }

    this.displayedReport = this.adapter.adapt(
      this.report,
      this.selectedChartType,
    );

    this.displayedReportChange.emit(this.displayedReport);
  }
}
