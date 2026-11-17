import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Sale, SalePage, SaleService } from '../../shared/services/sale-service';

@Component({
  selector: 'app-sales',
  imports: [CurrencyPipe, DatePipe, MatButtonModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './sales.html',
  styleUrl: './sales.scss',
})
export class Sales implements OnInit {
  readonly pageSize = 10;
  sales: Sale[] = [];
  currentPage = 1;
  totalSales = 0;
  totalPages = 0;
  loading = false;
  errorMessage = '';

  constructor(
    private readonly saleService: SaleService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadSales();
  }

  loadSales(page = this.currentPage) {
    this.loading = true;
    this.errorMessage = '';

    this.saleService
      .getSales(page, this.pageSize)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response: SalePage) => {
          this.sales = response.sales;
          this.currentPage = response.pagination.page;
          this.totalSales = response.pagination.total;
          this.totalPages = response.pagination.totalPages;
        },
        error: () => {
          this.errorMessage = 'Não foi possível carregar as vendas. Tente novamente.';
        },
      });
  }

  goToNewSale() {
    this.router.navigate(['/sales/new']);
  }

  viewSale(sale: Sale) {
    this.router.navigate(['/sales', sale.id]);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.loadSales(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.loadSales(this.currentPage + 1);
    }
  }

  trackBySaleId(_: number, sale: Sale) {
    return sale.id;
  }
}
