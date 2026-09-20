import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { Category, CategoryService } from '../../shared/services/category-service';

@Component({
  selector: 'app-categories',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  readonly categoryForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
  });

  categories: Category[] = [];
  loading = false;
  saving = false;
  deletingId: number | null = null;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly categoryService: CategoryService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.errorMessage = '';

    this.categoryService
      .getCategories()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (categories) => (this.categories = categories),
        error: () => {
          this.errorMessage = 'Não foi possível carregar as categorias. Tente novamente.';
        },
      });
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const name = this.categoryForm.controls.name.value.trim();

    if (!name) {
      this.categoryForm.controls.name.setErrors({ required: true });
      this.saving = false;
      return;
    }

    this.categoryService
      .createCategory({ name })
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (category) => {
          this.categories = [...this.categories, category];
          this.categoryForm.reset({ name: '' });
          this.successMessage = 'Categoria cadastrada com sucesso!';
        },
        error: (error) => {
          this.errorMessage = error?.error?.error || 'Não foi possível cadastrar a categoria.';
        },
      });
  }

  trackByCategoryId(_: number, category: Category) {
    return category.id;
  }

  deleteCategory(category: Category) {
    const confirmed = window.confirm(`Deseja excluir a categoria "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.deletingId = category.id;

    this.categoryService
      .deleteCategory(category.id)
      .pipe(
        finalize(() => {
          this.deletingId = null;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Categoria excluída com sucesso!';
          this.loadCategories();
        },
        error: (error) => {
          this.errorMessage = error?.error?.error || 'Não foi possível excluir a categoria.';
        },
      });
  }
}
