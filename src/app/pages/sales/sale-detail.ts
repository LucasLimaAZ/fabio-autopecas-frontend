import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Sale, SaleService } from '../../shared/services/sale-service';

@Component({
  selector: 'app-sale-detail',
  imports: [CurrencyPipe, DatePipe, MatButtonModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './sale-detail.html',
  styleUrl: './sale-detail.scss',
})
export class SaleDetail implements OnInit {
  sale: Sale | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly saleService: SaleService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const saleId = Number(this.route.snapshot.paramMap.get('id'));

    if (!saleId) {
      this.errorMessage = 'Venda não encontrada.';
      return;
    }

    this.loadSale(saleId);
  }

  loadSale(id: number) {
    this.loading = true;
    this.errorMessage = '';

    this.saleService
      .getSaleById(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (sale) => {
          this.sale = sale;
        },
        error: () => {
          this.errorMessage = 'Não foi possível carregar os detalhes da venda.';
        },
      });
  }

  goBack() {
    this.router.navigate(['/sales']);
  }

  get totalItems(): number {
    return this.sale?.items?.reduce((total, item) => total + Number(item.quantity ?? 0), 0) ?? 0;
  }

  getItemSubtotal(item: {
    quantity?: number;
    unit_price?: number | string | null;
    subtotal?: number | string | null;
  }): number | string {
    if (item.subtotal !== undefined && item.subtotal !== null && item.subtotal !== '') {
      return item.subtotal;
    }

    const quantity = Number(item.quantity ?? 0);
    const unitPrice = Number(item.unit_price ?? 0);
    return quantity * unitPrice;
  }
}
