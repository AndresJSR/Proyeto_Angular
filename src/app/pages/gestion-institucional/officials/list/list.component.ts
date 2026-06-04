import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { OfficialsAdminService } from '../officials.service';
import { Official } from '../official.model';
import { DeleteOfficialDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-officials-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './list.component.html',
})
export class OfficialsListComponent implements OnInit {
  private svc    = inject(OfficialsAdminService);
  private dialog = inject(MatDialog);

  officials = signal<Official[]>([]);
  loading   = signal(false);
  columns   = ['name', 'email', 'phone', 'role', 'status', 'gps', 'actions'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => { this.officials.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openDelete(o: Official) {
    this.dialog.open(DeleteOfficialDialogComponent, { data: o, width: '400px' })
      .afterClosed().subscribe(ok => { if (ok) this.load(); });
  }
}