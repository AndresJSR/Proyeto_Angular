import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from 'src/app/material.module';
import { ReportChatMessage } from '../../models/report-chat-message.model';

@Component({
  selector: 'app-report-chat',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './report-chat.component.html',
  styleUrl: './report-chat.component.scss',
})
export class ReportChatComponent {
  @Input() loading = false;
  @Input() messages: ReportChatMessage[] = [];

  @Output() querySubmit = new EventEmitter<string>();

  query = '';

  readonly examples: string[] = [
    'Cantidad de anotaciones por categoría',
    'Cantidad de reportes por categoría',
    'Reportes por barrio',
    'Cantidad de reportes por barrio',
    'Promedio de calificaciones por categoría',
    'Cantidad de anotaciones por estado',
  ];

  submitQuery(): void {
    const cleanQuery = this.query.trim();

    if (!cleanQuery || this.loading) {
      return;
    }

    this.querySubmit.emit(cleanQuery);
    this.query = '';
  }

  useExample(example: string): void {
    if (this.loading) {
      return;
    }

    this.query = example;
    this.submitQuery();
  }
}
