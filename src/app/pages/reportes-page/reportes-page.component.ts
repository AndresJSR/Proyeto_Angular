import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { MaterialModule } from 'src/app/material.module';
import { AppChart } from '../../components/chart/chart.component';

@Component({
  selector: 'app-reportes-page',
  standalone: true,
  imports: [CommonModule, MaterialModule, AppChart],
  templateUrl: './reportes-page.component.html',
  styleUrl: './reportes-page.component.scss',
})
export class ReportesPageComponent {}
