import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { CategoriesService } from '../../services/categories.service';
import { EntitiesService } from '../../services/entities.service';
import { AnotacionFormService } from '../../services/anotacion-form.service';
import { Category } from '../../models/category.model';
import { Entity } from '../../models/entity.model';
import { NeighborhoodSearchResult } from '../../models/annotation.model';
import { environment } from 'src/environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-anotacion-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './anotacion-form.component.html',
  styleUrls: ['./anotacion-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnotacionFormComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly anotacionFormService = inject(AnotacionFormService);
  private readonly catSvc = inject(CategoriesService);
  private readonly entSvc = inject(EntitiesService);

  coords = input<[number, number] | null>(null);
  closed = output<void>();
  saved = output<number>();

  categories = signal<Category[]>([]);
  entities = signal<Entity[]>([]);
  categorySearch = signal('');
  maxFiles = 5;
  filteredCategories = computed(() =>
    this.categories().filter(c =>
      c.name.toLowerCase().includes(this.categorySearch().toLowerCase())
    )
  );
  brokenCategoryImages = signal(new Set<number>());

  selectedCategories = new Set<number>();
  selectedEntities = new Set<number>();
  selectedEntityIds = signal<number[]>([]);
  files = signal<File[]>([]);
  saving = signal(false);
  outOfBoundsNeighborhood = signal<NeighborhoodSearchResult | null>(null);

  description = '';
  id_citizen = 1;

  ngOnInit() {
    this.catSvc
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(c => this.categories.set(c));

    this.entSvc
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(e => this.entities.set(e));

    const c = this.coords();
    if (c) {
      this.anotacionFormService
        .searchNeighborhood(c[0], c[1])
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: res => this.outOfBoundsNeighborhood.set(res?.length ? res[0] : null),
          error: () => this.outOfBoundsNeighborhood.set(null),
        });
    }
  }

  toggleCat(id: number) {
    this.selectedCategories.has(id)
      ? this.selectedCategories.delete(id)
      : this.selectedCategories.add(id);
  }

  resolveCategoryImageUrl(imageUrl: string | null): string | null {
    if (!imageUrl) {
      return null;
    }

    // absolute URLs and data URIs — keep
    if (
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://') ||
      imageUrl.startsWith('data:')
    ) {
      return imageUrl;
    }

    // static assets inside the app
    if (imageUrl.startsWith('/assets') || imageUrl.startsWith('assets')) {
      return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    }

    // If environment.apiUrl is set, build absolute URL against it.
    const cleaned = imageUrl.replace(/^\.?\//, '');
    if (environment.apiUrl && environment.apiUrl.trim()) {
      return `${environment.apiUrl.replace(/\/$/, '')}/${cleaned}`;
    }

    // Development: proxy static files through `/api/` so the dev server forwards to backend
    return `/api/${cleaned}`;
  }

  onCategoryImageError(categoryId: number) {
    const next = new Set(this.brokenCategoryImages());
    next.add(categoryId);
    this.brokenCategoryImages.set(next);
  }

  toggleEnt(id: number) {
    this.selectedEntities.has(id)
      ? this.selectedEntities.delete(id)
      : this.selectedEntities.add(id);

    this.selectedEntityIds.set([...this.selectedEntities]);
  }

  onEntitiesSelectionChange(ids: number[] | null) {
    const nextIds = ids ?? [];
    this.selectedEntities = new Set(nextIds);
    this.selectedEntityIds.set(nextIds);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const dropped = event.dataTransfer?.files;
    if (!dropped?.length) {
      return;
    }

    const images = Array.from(dropped).filter(file => file.type.startsWith('image/'));
    const current = this.files();
    const available = Math.max(this.maxFiles - current.length, 0);
    this.files.set([...current, ...images.slice(0, available)]);
  }

  onFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) {
      return;
    }

    const selected = Array.from(input.files).filter(file => file.type.startsWith('image/'));
    const current = this.files();
    const available = Math.max(this.maxFiles - current.length, 0);
    this.files.set([...current, ...selected.slice(0, available)]);
    input.value = '';
  }

  removeFile(index: number) {
    this.files.set(this.files().filter((_, i) => i !== index));
  }

  save() {
    const c = this.coords();
    if (!c || !this.description.trim()) {
      return;
    }

    this.saving.set(true);

    this.anotacionFormService
      .saveAll(
        c,
        {
          id_neighborhood: 1,
          id_citizen: this.id_citizen,
          description: this.description.trim(),
          latitude: c[0],
          longitude: c[1],
          status: 'active',
        },
        {
          categoryIds: [...this.selectedCategories],
          entityIds: [...this.selectedEntities],
          files: this.files(),
        }
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: id => {
          this.saving.set(false);
          this.anotacionFormService.loadAllAnnotations();
          this.saved.emit(id);
          this.closed.emit();
        },
        error: () => this.saving.set(false),
      });
  }
}