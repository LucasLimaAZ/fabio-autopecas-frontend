import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface LowStockProduct {
  id: number;
  name: string;
  ref: string;
  category_id: number;
  amount: number;
  minimum_amount: number;
  missing_amount: number;
  sale_price: string;
}

export interface TopSellingProduct {
  rank: number;
  product_id: number;
  name: string;
  ref: string;
  category_id: number;
  amount: number;
  sale_price: string;
  total_quantity: number;
  total_amount: string;
}

export interface TopSellingPeriod {
  startDate: string;
  endDate: string;
}

export interface DashboardResponse {
  totalSalesToday: number;
  lowStockProducts: LowStockProduct[];
  topSellingProducts: TopSellingProduct[];
  topSellingPeriod: TopSellingPeriod;
}

export interface HomeStats {
  totalSalesToday: number;
  lowStockProducts: LowStockProduct[];
  topSellingProducts: TopSellingProduct[];
  topSellingPeriod: TopSellingPeriod;
}

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private readonly endpoint = `${environment.apiUrl}/dashboard`;

  constructor(private readonly http: HttpClient) {}

  getHomeStats(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.endpoint);
  }
}
