import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-report-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './report-chat.component.html',
  styleUrl: './report-chat.component.scss',
})
export class ReportChatComponent {
  @Input() loading = false;

  @Output() querySubmit = new EventEmitter<string>();

  query = '';

  submitQuery(): void {
    const cleanQuery = this.query.trim();

    if (!cleanQuery) {
      return;
    }

    this.querySubmit.emit(cleanQuery);
  }
}
