import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { AnnotationsService } from '../../services/annotations.service';
import { EvidencesService } from '../../services/evidences.service';
import { InterestedPartiesService } from '../../services/interested-parties.service';
import { CategoriesService } from '../../services/categories.service';
import { EntitiesService } from '../../services/entities.service';
import { AnnotationCategoriesService } from '../../services/annotation-categories.service';
import { Category } from '../../models/category.model';
import { Entity } from '../../models/entity.model';
import { forkJoin, of, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-anotacion-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './anotacion-form.component.html',
})
export class AnotacionFormComponent implements OnInit {
  private annSvc = inject(AnnotationsService);
  private evidSvc = inject(EvidencesService);
  private intSvc = inject(InterestedPartiesService);
  private catSvc = inject(CategoriesService);
  private entSvc = inject(EntitiesService);
  private annCatSvc = inject(AnnotationCategoriesService);
  private http = inject(HttpClient);

  coords = input<[number, number] | null>(null);
  closed = output<void>();
  saved = output<number>(); // emite id_annotation

  categories = signal<Category[]>([]);
  entities = signal<Entity[]>([]);
  selectedCategories = new Set<number>();
  selectedEntities = new Set<number>();
  files = signal<File[]>([]);
  saving = signal(false);
  outOfBounds = signal(false);

  description = '';
  id_citizen = 1; // TODO: reemplazar con auth

  ngOnInit() {
    this.catSvc.getAll().subscribe(c => this.categories.set(c));
    this.entSvc.getAll().subscribe(e => this.entities.set(e));
    // CU-12 flujo 4a: verificar si cae en barrio
    const c = this.coords();
    if (c) {
      this.http.get<any[]>(
        `${environment.apiUrl}/api/neighborhoods/search?lat=${c[0]}&lng=${c[1]}`
      ).subscribe({
        next: res => this.outOfBounds.set(!res?.length),
        error: () => this.outOfBounds.set(false)
      });
    }
  }

  toggleCat(id: number) {
    this.selectedCategories.has(id)
      ? this.selectedCategories.delete(id)
      : this.selectedCategories.add(id);
  }

  toggleEnt(id: number) {
    this.selectedEntities.has(id)
      ? this.selectedEntities.delete(id)
      : this.selectedEntities.add(id);
  }

  onFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.files.set(Array.from(input.files));
  }

  save(forceOutOfBounds = false) {
    if (this.outOfBounds() && !forceOutOfBounds) return;
    const c = this.coords();
    if (!c || !this.description.trim()) return;

    this.saving.set(true);

    this.http.post<any>(`${environment.apiUrl}/api/annotations`, {
      id_neighborhood: 1, // backend puede resolver por coords
      id_citizen: this.id_citizen,
      description: this.description,
      latitude: c[0],
      longitude: c[1],
      status: 'active'
    }).pipe(
      switchMap(ann => {
        const id = ann.id_annotation;
        const cats$ = [...this.selectedCategories].map(id_cat =>
          this.http.post(`${environment.apiUrl}/api/annotation-categories`, {
            id_category: id_cat, id_annotation: id
          })
        );
        const ents$ = [...this.selectedEntities].map(id_ent =>
          this.intSvc.create(id_ent, id)
        );
        const files$ = this.files().map(f => this.evidSvc.upload(id, f));
        const all = [...cats$, ...ents$, ...files$];
        return all.length ? forkJoin(all).pipe(switchMap(() => of(id))) : of(id);
      })
    ).subscribe({
      next: id => {
        this.saving.set(false);
        this.annSvc.loadAll();
        this.saved.emit(id);
        this.closed.emit();
      },
      error: () => this.saving.set(false)
    });
  }
}