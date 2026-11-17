import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Product, ProductService } from '../../shared/services/product-service';
import { CreateSalePayload, SaleService } from '../../shared/services/sale-service';

interface SaleItemRow {
  product_id: number;
  product: Product;
  quantity: number;
  unit_price: number;
}

@Component({
  selector: 'app-new-sale',
  imports: [
    CurrencyPipe,
    MatAutocompleteModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './new-sale.html',
  styleUrl: './new-sale.scss',
})
export class NewSale implements OnInit {
  readonly saleForm = new FormGroup({
    sale_date: new FormControl<Date | null>(this.getTodayDate(), {
      validators: [Validators.required],
    }),
    notes: new FormControl('', { nonNullable: true }),
  });

  readonly addItemForm = new FormGroup({
    product_id: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
    quantity: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  readonly productSearchControl = new FormControl<string | Product>('', { nonNullable: true });

  filteredProducts: Product[] = [];
  saleItems: SaleItemRow[] = [];
  selectedProductId: number | null = null;
  productSearchLoading = false;
  loading = false;
  errorMessage = '';
  successMessage = '';
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly productService: ProductService,
    private readonly saleService: SaleService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.productSearchControl.valueChanges
      .pipe(
        filter((value): value is string => typeof value === 'string'),
        tap(() => {
          this.selectedProductId = null;
          this.addItemForm.patchValue({ product_id: null });
        }),
        map((value) => value.trim()),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((term) => {
          this.errorMessage = '';

          if (!term) {
            this.filteredProducts = [];
            return of<Product[]>([]);
          }

          this.productSearchLoading = true;
          this.filteredProducts = [];

          return this.productService.searchProducts(term).pipe(
            catchError(() => {
              this.errorMessage = 'Não foi possível buscar os produtos. Tente novamente.';
              return of<Product[]>([]);
            }),
            finalize(() => {
              this.productSearchLoading = false;
              this.cdr.detectChanges();
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((products) => {
        this.filteredProducts = products;
      });
  }

  get totalSaleAmount(): number {
    return this.saleItems.reduce((total, item) => total + this.calculateItemSubtotal(item), 0);
  }

  calculateItemSubtotal(item: SaleItemRow): number {
    return item.quantity * item.unit_price;
  }

  addItem() {
    this.errorMessage = '';
    this.successMessage = '';

    const selectedProductId = this.selectedProductId ?? this.addItemForm.getRawValue().product_id;

    if (!selectedProductId || this.addItemForm.invalid) {
      this.addItemForm.markAllAsTouched();
      this.errorMessage = 'Selecione um produto válido para adicionar.';
      return;
    }

    const selectedProduct = this.filteredProducts.find(
      (product) => product.id === selectedProductId,
    );

    if (!selectedProduct) {
      this.errorMessage = 'Selecione um produto válido para adicionar.';
      return;
    }

    const quantity = Number(this.addItemForm.getRawValue().quantity ?? 1);
    const unitPrice = Number(selectedProduct.sale_price ?? 0);

    this.saleItems.push({
      product_id: selectedProduct.id,
      product: selectedProduct,
      quantity,
      unit_price: unitPrice,
    });

    this.addItemForm.reset({
      product_id: null,
      quantity: 1,
    });
    this.selectedProductId = null;
    this.productSearchControl.setValue('');
    this.filteredProducts = [];
  }

  selectProduct(product: Product | null) {
    if (!product) {
      this.selectedProductId = null;
      this.addItemForm.patchValue({ product_id: null });
      return;
    }

    this.selectedProductId = product.id;
    this.addItemForm.patchValue({ product_id: product.id });
    this.productSearchControl.setValue(product.name, { emitEvent: false });
  }

  displayProductName(product: Product | string | null): string {
    if (typeof product === 'string') {
      return product;
    }

    return product ? product.name : '';
  }

  updateItemQuantity(index: number, value: number) {
    const item = this.saleItems[index];
    if (!item) {
      return;
    }

    const nextQuantity = Number.isFinite(value) ? Math.max(1, value) : 1;
    item.quantity = nextQuantity;
  }

  updateItemUnitPrice(index: number, value: number) {
    const item = this.saleItems[index];
    if (!item) {
      return;
    }

    const nextPrice = Number.isFinite(value) ? Math.max(0, value) : 0;
    item.unit_price = nextPrice;
  }

  removeItem(index: number) {
    this.saleItems.splice(index, 1);
    this.errorMessage = '';
    this.successMessage = '';
  }

  goBack() {
    this.router.navigate(['/']);
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.saleForm.invalid) {
      this.saleForm.markAllAsTouched();
      return;
    }

    if (this.saleItems.length === 0) {
      this.errorMessage = 'Adicione pelo menos um produto para registrar a venda.';
      return;
    }

    this.loading = true;
    const formValue = this.saleForm.getRawValue();
    const payload: CreateSalePayload = {
      sale_date: this.formatDateValue(formValue.sale_date) || this.getTodayDateString(),
      notes: formValue.notes?.trim() || null,
      items: this.saleItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    };

    this.saleService
      .createSale(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Venda registrada com sucesso.';
          this.saleItems = [];
          this.saleForm.reset({
            sale_date: this.getTodayDate(),
            notes: '',
          });
        },
        error: () => {
          this.errorMessage = 'Não foi possível registrar a venda. Tente novamente.';
        },
      });
  }

  private getTodayDate(): Date {
    return new Date();
  }

  private getTodayDateString(): string {
    return this.formatDateValue(new Date()) ?? new Date().toISOString().slice(0, 10);
  }

  private formatDateValue(value: Date | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const normalized = new Date(date.getTime() - offset * 60 * 1000);
    return normalized.toISOString().slice(0, 10);
  }
}
