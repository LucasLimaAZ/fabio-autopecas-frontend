import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { HomeService, HomeStats } from '../../shared/services/home-service';

@Component({
  selector: 'app-home-page',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  stats: HomeStats = {
    totalProducts: 0,
    totalUsers: 0,
    totalSales: 0,
    lowStockProducts: 0,
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
          this.stats = this.normalizeStats(response);
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMessage = 'Não foi possível carregar os dados da página inicial.';
          this.cdr.detectChanges();
        },
      });
  }

  private normalizeStats(stats: Partial<HomeStats> | null | undefined): HomeStats {
    const totalProducts =
      Number(stats?.totalProducts ?? stats?.productsCount ?? stats?.products_quantity ?? 0) || 0;
    const totalUsers =
      Number(stats?.totalUsers ?? stats?.usersCount ?? stats?.users_quantity ?? 0) || 0;
    const totalSales =
      Number(stats?.totalSales ?? stats?.salesCount ?? stats?.sales_quantity ?? 0) || 0;
    const lowStockProducts =
      Number(
        stats?.lowStockProducts ?? stats?.lowStockProductsCount ?? stats?.low_stock_products ?? 0,
      ) || 0;

    return {
      totalProducts,
      totalUsers,
      totalSales,
      lowStockProducts,
    };
  }
}
