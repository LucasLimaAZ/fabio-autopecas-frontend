import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import {
  HomeService,
  DashboardResponse,
  LowStockProduct,
  TopSellingProduct,
} from '../../shared/services/home-service';

@Component({
  selector: 'app-home-page',
  imports: [DatePipe, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  dashboard: DashboardResponse = {
    totalSalesToday: 0,
    lowStockProducts: [],
    topSellingProducts: [],
    topSellingPeriod: { startDate: '', endDate: '' },
  };
  loading = false;
  errorMessage = '';

  constructor(
    private readonly homeService: HomeService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.errorMessage = '';

    this.homeService
      .getHomeStats()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response) => {
          this.dashboard = {
            totalSalesToday: Number(response?.totalSalesToday ?? 0),
            lowStockProducts: (response?.lowStockProducts ?? []).slice(0, 5),
            topSellingProducts: (response?.topSellingProducts ?? []).slice(0, 5),
            topSellingPeriod: response?.topSellingPeriod ?? { startDate: '', endDate: '' },
          };
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Não foi possível carregar os dados da página inicial.';
          this.cdr.detectChanges();
        },
      });
  }

  get lowStockItems(): LowStockProduct[] {
    return this.dashboard.lowStockProducts;
  }

  get topSellingItems(): TopSellingProduct[] {
    return this.dashboard.topSellingProducts;
  }

  getMaxSoldQuantity(): number {
    return Math.max(...this.topSellingItems.map((product) => product.total_quantity), 1);
  }

  getBarWidth(product: TopSellingProduct): number {
    return Math.max((product.total_quantity / this.getMaxSoldQuantity()) * 100, 4);
  }
}
