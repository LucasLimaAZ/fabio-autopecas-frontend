import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CreateProductPayload, ProductService } from '../../shared/services/product-service';

@Component({
  selector: 'app-new-product',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './new-product.html',
  styleUrl: './new-product.scss',
})
export class NewProduct implements OnInit {
  readonly productForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    ref: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    notes: new FormControl('', { nonNullable: true }),
    cost_price: new FormControl<number | null>(null, { validators: [Validators.min(0)] }),
    sale_price: new FormControl<number | null>(null, { validators: [Validators.min(0)] }),
    amount: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    minimum_amount: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    category_id: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  loading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;
  productId: number | null = null;

  constructor(
    private readonly productService: ProductService,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));

      if (id && Number.isFinite(id)) {
        this.productId = id;
        this.isEditMode = true;
        this.loadProduct(id);
        return;
      }

      this.productId = null;
      this.isEditMode = false;
      this.resetForm();
    });
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.productForm.getRawValue();
    const product: CreateProductPayload = {
      name: formValue.name,
      ref: formValue.ref,
      notes: formValue.notes || null,
      cost_price: formValue.cost_price,
      sale_price: formValue.sale_price,
      amount: formValue.amount,
      minimum_amount: formValue.minimum_amount,
      category_id: formValue.category_id as number,
    };

    const request$ =
      this.isEditMode && this.productId !== null
        ? this.productService.updateProduct(this.productId, product)
        : this.productService.createProduct(product);

    request$
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          if (this.isEditMode) {
            this.successMessage = 'Produto atualizado com sucesso.';
            this.router.navigate(['/products']);
            return;
          }

          this.successMessage = 'Produto cadastrado com sucesso.';
          this.resetForm();
        },
        error: () => {
          if (this.isEditMode) {
            this.errorMessage = 'Não foi possível atualizar o produto. Tente novamente.';
            return;
          }

          this.errorMessage = 'Não foi possível cadastrar o produto. Tente novamente.';
        },
      });
  }

  private loadProduct(id: number) {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.productService
      .getProductById(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (product) => {
          this.productForm.reset({
            name: product.name,
            ref: product.ref,
            notes: product.notes ?? '',
            cost_price: product.cost_price,
            sale_price: product.sale_price,
            amount: product.amount,
            minimum_amount: product.minimum_amount,
            category_id: product.category_id,
          });
        },
        error: () => {
          this.errorMessage = 'Não foi possível carregar o produto para edição.';
          this.router.navigate(['/products']);
        },
      });
  }

  private resetForm() {
    this.productForm.reset({
      name: '',
      ref: '',
      notes: '',
      cost_price: null,
      sale_price: null,
      amount: 0,
      minimum_amount: 0,
      category_id: null,
    });
  }
}
