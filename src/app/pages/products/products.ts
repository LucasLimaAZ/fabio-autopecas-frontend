import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  EMPTY,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { Product, ProductPage, ProductService } from '../../shared/services/product-service';

@Component({
  selector: 'app-products',
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  readonly pageSize = 10;
  readonly searchControl = new FormControl('', { nonNullable: true });
  products: Product[] = [];
  currentPage = 1;
  totalProducts = 0;
  totalPages = 0;
  loading = false;
  errorMessage = '';
  activeSearch = '';
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly productService: ProductService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadProducts();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => {
          this.loading = true;
          this.errorMessage = '';
        }),
        tap((value) => (this.activeSearch = value.trim())),
        switchMap(() =>
          this.getProductsRequest(1).pipe(
            catchError(() => {
              this.errorMessage = 'Não foi possível buscar os produtos. Tente novamente.';
              return EMPTY;
            }),
            finalize(() => {
              this.loading = false;
              this.cdr.detectChanges();
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.updateProducts(response),
      });
  }

  loadProducts(page = this.currentPage) {
    this.loading = true;
    this.errorMessage = '';

    this.getProductsRequest(page)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response) => this.updateProducts(response),
        error: () => {
          this.errorMessage = 'Não foi possível carregar os produtos. Tente novamente.';
        },
      });
  }

  goToNewProduct() {
    this.router.navigate(['/products/new']);
  }

  clearSearch() {
    this.searchControl.setValue('');
  }

  private getProductsRequest(page: number) {
    if (!this.activeSearch) {
      return this.productService.getProducts(page, this.pageSize);
    }

    return this.productService.searchProducts(this.activeSearch).pipe(
      map((products) => ({
        products,
        pagination: {
          page: 1,
          limit: products.length,
          total: products.length,
          totalPages: products.length > 0 ? 1 : 0,
        },
      })),
    );
  }

  private updateProducts(response: ProductPage) {
    this.products = response.products;
    this.currentPage = response.pagination.page;
    this.totalProducts = response.pagination.total;
    this.totalPages = response.pagination.totalPages;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.loadProducts(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.loadProducts(this.currentPage + 1);
    }
  }

  trackByProductId(_: number, product: Product) {
    return product.id;
  }
}
