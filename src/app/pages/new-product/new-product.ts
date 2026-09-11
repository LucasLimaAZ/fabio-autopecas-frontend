import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
export class NewProduct {
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

  constructor(
    private readonly productService: ProductService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

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
      ...formValue,
      notes: formValue.notes || null,
      cost_price: formValue.cost_price,
      sale_price: formValue.sale_price,
      category_id: formValue.category_id as number,
    };

    this.productService
      .createProduct(product)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Produto cadastrado com sucesso.';
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
        },
        error: () => {
          this.errorMessage = 'Não foi possível cadastrar o produto. Tente novamente.';
        },
      });
  }
}
