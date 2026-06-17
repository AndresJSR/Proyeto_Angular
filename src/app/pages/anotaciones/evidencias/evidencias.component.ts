import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { AnnotationsService } from '../../mapa-territorial/services/annotations.service';
import { EvidencesService } from '../../mapa-territorial/services/evidences.service';
import { Annotation } from '../../../models/annotation.model';
import { Evidence } from '../../../models/evidence.model';

@Component({
  selector: 'app-evidencias',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './evidencias.component.html',
  styleUrl: './evidencias.component.scss'
})
export class EvidenciasComponent implements OnInit {
  private annSvc = inject(AnnotationsService);
  private evidSvc = inject(EvidencesService);

  annotations = this.annSvc.all;
  loading = this.annSvc.loading;

  selectedAnnotation = signal<Annotation | null>(null);
  evidences = signal<Evidence[]>([]);
  loadingEvidences = signal(false);
  uploading = signal(false);
  searchText = '';
  ngOnInit() {
    this.annSvc.loadAll();
  }

  selectAnnotation(a: Annotation) {
    this.selectedAnnotation.set(a);
    this.loadEvidences(a.id_annotation);
  }

  loadEvidences(id: number) {
    this.loadingEvidences.set(true);
    this.evidSvc.getByAnnotation(id).subscribe({
      next: data => {
        this.evidences.set(data);
        this.loadingEvidences.set(false);
      },
      error: () => this.loadingEvidences.set(false)
    });
  }

  onFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    const ann = this.selectedAnnotation();
    if (!input.files || !ann) return;

    this.uploading.set(true);
    const files = Array.from(input.files);
    let completed = 0;

    files.forEach(file => {
      this.evidSvc.upload(ann.id_annotation, file).subscribe({
        next: () => {
          completed++;
          if (completed === files.length) {
            this.uploading.set(false);
            this.loadEvidences(ann.id_annotation);
          }
        },
        error: () => {
          completed++;
          if (completed === files.length) this.uploading.set(false);
        }
      });
    });

    input.value = '';
  }

  deleteEvidence(id: number) {
    this.evidSvc.delete(id).subscribe(() => {
      const ann = this.selectedAnnotation();
      if (ann) this.loadEvidences(ann.id_annotation);
    });
  }

  resolveImageUrl(fileUrl: string): string {
    return this.evidSvc.resolveImageUrl(fileUrl);
  }

  get filteredAnnotations() {
    const q = this.searchText.toLowerCase();
    return q
      ? this.annotations().filter(a =>
          a.description.toLowerCase().includes(q) ||
          String(a.id_annotation).includes(q)
        )
      : this.annotations();
  }
}
