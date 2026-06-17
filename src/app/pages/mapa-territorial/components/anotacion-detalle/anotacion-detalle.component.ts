import { Component, inject, input, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { Annotation } from '../../../../models/annotation.model';
import { VotesService } from '../../services/votes.service';
import { Vote } from '../../../../models/vote.model';
import { EvidencesService } from '../../services/evidences.service';
import { Evidence } from '../../../../models/evidence.model';
import { AnnotationCategoriesService } from '../../services/annotation-categories.service';
import { CategoriesService } from '../../services/categories.service';
import { Category } from '../../../../models/category.model';

@Component({
  selector: 'app-anotacion-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './anotacion-detalle.component.html',
  styleUrl: './anotacion-detalle.component.scss'
})
export class AnotacionDetalleComponent implements OnChanges {
  private votesSvc = inject(VotesService);
  private evidencesSvc = inject(EvidencesService);
  private annCatSvc = inject(AnnotationCategoriesService);
  private catSvc = inject(CategoriesService);

  annotation = input<Annotation | null>(null);

  votes = signal<Vote[]>([]);
  avgStars = signal<number>(0);
  existingVote = signal<Vote | null>(null);
  evidences = signal<Evidence[]>([]);
  categories = signal<Category[]>([]);
  selectedImageIndex = signal<number>(0);

  stars = 0;
  comment = '';
  saving = signal(false);

  readonly ID_CITIZEN = 1;
  readonly stars_range = [1, 2, 3, 4, 5];

  ngOnChanges() {
    const ann = this.annotation();
    if (!ann) return;
    this.stars = 0;
    this.comment = '';
    this.evidences.set([]);
    this.categories.set([]);
    this.selectedImageIndex.set(0);
    this.loadVotes(ann.id_annotation);
    this.loadEvidences(ann.id_annotation);
    this.loadCategories(ann.id_annotation);
  }

  private loadVotes(id: number) {
    this.votesSvc.getByAnnotation(id).subscribe(votes => {
      this.votes.set(votes);
      const avg = votes.length
        ? votes.reduce((s, v) => s + v.stars, 0) / votes.length
        : 0;
      this.avgStars.set(Math.round(avg * 10) / 10);
      const mine = votes.find(v => v.id_citizen === this.ID_CITIZEN) ?? null;
      this.existingVote.set(mine);
      if (mine) { this.stars = mine.stars; this.comment = mine.comment; }
    });
  }

  private loadEvidences(id: number) {
    this.evidencesSvc.getByAnnotation(id).subscribe({
      next: evs => this.evidences.set(evs ?? []),
      error: () => this.evidences.set([])
    });
  }

  private loadCategories(id: number) {
    this.annCatSvc.getAll().subscribe(acs => {
      const catIds = acs.filter(ac => ac.id_annotation === id).map(ac => ac.id_category);
      if (!catIds.length) return;
      this.catSvc.getAll().subscribe(cats => {
        this.categories.set(cats.filter(c => catIds.includes(c.id_category)));
      });
    });
  }

  resolveImageUrl(fileUrl: string): string {
    return this.evidencesSvc.resolveImageUrl(fileUrl);
  }

  setStars(n: number) { this.stars = n; }

  submit() {
    const ann = this.annotation();
    if (!ann || !this.stars) return;
    this.saving.set(true);
    const payload = {
      id_citizen: this.ID_CITIZEN,
      id_annotation: ann.id_annotation,
      stars: this.stars,
      comment: this.comment
    };
    const existing = this.existingVote();
    const req$ = existing
      ? this.votesSvc.update(existing.id_vote, payload)
      : this.votesSvc.create(payload);
    req$.subscribe({
      next: () => { this.saving.set(false); this.loadVotes(ann.id_annotation); },
      error: () => this.saving.set(false)
    });
  }

  getStarColor(index: number): string {
    return index < Math.round(this.avgStars()) ? '#f59e0b' : '#e2e8f0';
  }

  getRelativeDate(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Hace 1 día';
    if (days < 7) return `Hace ${days} días`;
    if (days < 30) return `Hace ${Math.floor(days / 7)} semana(s)`;
    return `Hace ${Math.floor(days / 30)} mes(es)`;
  }
} 
