import { Component, inject, input, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { Annotation } from '../../models/annotation.model';
import { VotesService } from '../../services/votes.service';
import { Vote } from '../../models/vote.model';

@Component({
  selector: 'app-anotacion-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './anotacion-detalle.component.html',
  styleUrl: './anotacion-detalle.component.scss'
})
export class AnotacionDetalleComponent implements OnChanges {
  private votesSvc = inject(VotesService);

  annotation = input<Annotation | null>(null);

  votes = signal<Vote[]>([]);
  avgStars = signal<number>(0);
  existingVote = signal<Vote | null>(null);

  // formulario
  stars = 0;
  comment = '';
  saving = signal(false);

  readonly ID_CITIZEN = 1; // TODO: reemplazar con auth

  ngOnChanges() {
    const ann = this.annotation();
    if (!ann) return;
    this.stars = 0;
    this.comment = '';
    this.loadVotes(ann.id_annotation);
  }

  private loadVotes(id: number) {
    this.votesSvc.getByAnnotation(id).subscribe(votes => {
      this.votes.set(votes);
      const avg = votes.length
        ? votes.reduce((s, v) => s + v.stars, 0) / votes.length
        : 0;
      this.avgStars.set(Math.round(avg * 10) / 10);
      // CU-13 flujo 4a: voto existente del ciudadano
      const mine = votes.find(v => v.id_citizen === this.ID_CITIZEN) ?? null;
      this.existingVote.set(mine);
      if (mine) { this.stars = mine.stars; this.comment = mine.comment; }
    });
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
      next: () => {
        this.saving.set(false);
        this.loadVotes(ann.id_annotation);
      },
      error: () => this.saving.set(false)
    });
  }

  stars_range = [1, 2, 3, 4, 5];
}