import { Component } from '@angular/core';

import { MaterialModule } from 'src/app/material.module';
import { ReportChartComponent } from '../../components/report-chart/report-chart.component';
import { ReportChatComponent } from '../../components/report-chat/report-chat.component';
import { ReportStatsComponent } from '../../components/report-stats/report-stats.component';
import { ReportChatMessage } from '../../models/report-chat-message.model';
import {
  ReportErrorResponse,
  ReportResponse,
} from '../../models/report-response.model';
import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-reportes-page',
  imports: [
    MaterialModule,
    ReportChatComponent,
    ReportStatsComponent,
    ReportChartComponent,
  ],
  templateUrl: './reportes-page.component.html',
  styleUrl: './reportes-page.component.scss',
})
export class ReportesPageComponent {
  report: ReportResponse | null = null;
  displayedReport: ReportResponse | null = null;

  messages: ReportChatMessage[] = [];
  loading = false;

  private nextMessageId = 1;

  constructor(private readonly reportsService: ReportsService) {}
  readonly supportedQuestions: string[] = [
    'Cantidad de anotaciones por categoría',
    'Cantidad de reportes por categoría',
    'Reportes por barrio',
    'Cantidad de reportes por barrio',
    'Promedio de calificaciones por categoría',
    'Cantidad de anotaciones por estado',
  ];
  onQuerySubmit(query: string): void {
    if (this.loading) {
      return;
    }

    this.addUserMessage(query);

    if (!this.isSupportedQuestion(query)) {
      this.addErrorMessage(
        'No fue posible interpretar esta consulta. Por ahora intenta con una de las preguntas sugeridas.',
      );
      return;
    }

    this.loading = true;

    this.reportsService.generateReport(query).subscribe({
      next: (response) => {
        this.report = response;
        this.displayedReport = response;
        this.loading = false;

        this.addSystemMessage(
          response.message ??
            'Reporte generado correctamente. Puedes revisar la gráfica y las estadísticas.',
        );
      },
      error: (error: ReportErrorResponse) => {
        this.loading = false;
        this.addErrorMessage(error.message);
      },
    });
  }

  onDisplayedReportChange(report: ReportResponse | Event | null): void {
    if (report instanceof Event) {
      return;
    }

    this.displayedReport = report;
  }

  clearReport(): void {
    this.report = null;
    this.displayedReport = null;
    this.messages = [];
    this.nextMessageId = 1;
  }

  private addUserMessage(text: string): void {
    this.messages = [
      ...this.messages,
      {
        id: this.nextMessageId++,
        role: 'user',
        text,
        createdAt: new Date(),
      },
    ];
  }

  private addSystemMessage(text: string): void {
    this.messages = [
      ...this.messages,
      {
        id: this.nextMessageId++,
        role: 'system',
        text,
        createdAt: new Date(),
      },
    ];
  }

  private addErrorMessage(text: string): void {
    this.messages = [
      ...this.messages,
      {
        id: this.nextMessageId++,
        role: 'system',
        text,
        createdAt: new Date(),
        error: true,
      },
    ];
  }
  private isSupportedQuestion(query: string): boolean {
    const normalizedQuery = this.normalizeText(query);

    return this.supportedQuestions.some(
      (question) => this.normalizeText(question) === normalizedQuery,
    );
  }

  private normalizeText(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
