import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { CitizensService } from '../citizens.service';
import { Citizen } from '../../../../models/citizen.model';
import { DeleteCitizenDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-citizens-list',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule],
  templateUrl: './list.component.html',
})
export class CitizensListComponent implements OnInit {
  private svc    = inject(CitizensService);
  private dialog = inject(MatDialog);

  citizens = signal<Citizen[]>([]);
  loading  = signal(false);
  search   = signal('');
  columns  = ['name', 'email', 'phone', 'address', 'status', 'actions'];

  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.citizens();
    return this.citizens().filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: d => { this.citizens.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openDelete(c: Citizen) {
    this.dialog.open(DeleteCitizenDialogComponent, { data: c, width: '400px' })
      .afterClosed().subscribe(ok => { if (ok) this.load(); });
  }
}