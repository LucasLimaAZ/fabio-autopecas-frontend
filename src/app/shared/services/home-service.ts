import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface HomeStats {
  totalProducts: number;
  totalUsers: number;
  totalSales: number;
  lowStockProducts: number;
  productsCount?: number;
  usersCount?: number;
  salesCount?: number;
  lowStockProductsCount?: number;
  products_quantity?: number;
  users_quantity?: number;
  sales_quantity?: number;
  low_stock_products?: number;
}

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private readonly endpoint = `${environment.apiUrl}/home`;

  constructor(private readonly http: HttpClient) {}

  getHomeStats(): Observable<HomeStats> {
    return this.http.get<HomeStats>(this.endpoint);
  }
}
