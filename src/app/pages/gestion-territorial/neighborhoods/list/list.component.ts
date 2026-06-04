import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { NeighborhoodsService } from '../neighborhoods.service';
import { Neighborhood } from '../neighborhood.model';
import { DeleteNeighborhoodDialogComponent } from '../delete-dialog/delete-dialog.component';
import { CommunesService } from '../../communes/communes.service';
import { Commune } from '../../communes/commune.model';

@Component({
  selector: 'app-neighborhoods-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './list.component.html',
})
export class NeighborhoodsListComponent implements OnInit {
  private svc        = inject(NeighborhoodsService);
  private communeSvc = inject(CommunesService);
  private dialog     = inject(MatDialog);

  neighborhoods = signal<Neighborhood[]>([]);
  communes      = signal<Commune[]>([]);
  loading       = signal(false);
  columns       = ['name', 'commune', 'status', 'actions'];

  ngOnInit() {
    this.communeSvc.getAll().subscribe(c => this.communes.set(c));
    this.load();
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => { this.neighborhoods.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  communeName(id: number) {
    return this.communes().find(c => c.id_commune === id)?.name ?? id;
  }

  openDelete(n: Neighborhood) {
    this.dialog.open(DeleteNeighborhoodDialogComponent, { data: n, width: '400px' })
      .afterClosed().subscribe(ok => { if (ok) this.load(); });
  }
}