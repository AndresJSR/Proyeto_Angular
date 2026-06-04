import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { CommunesService } from '../communes.service';
import { Commune } from '../commune.model';
import { DeleteCommuneDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-communes-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './list.component.html',
})
export class CommunesListComponent implements OnInit {
  private svc    = inject(CommunesService);
  private dialog = inject(MatDialog);

  communes = signal<Commune[]>([]);
  loading  = signal(false);
  columns  = ['name', 'id_city', 'status', 'actions'];

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => { this.communes.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openDelete(c: Commune) {
    this.dialog.open(DeleteCommuneDialogComponent, { data: c, width: '400px' })
      .afterClosed().subscribe(ok => { if (ok) this.load(); });
  }
}