import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export type ReportPeriod = 'week' | 'month' | 'year';

export interface ProductSalesSummary {
  product_id: number;
  product_name: string;
  ref: string;
  category_id?: number;
  total_quantity: number;
  total_amount: string | number;
  average_unit_price?: string | number;
}

export interface ProductsSoldReport {
  startDate: string;
  endDate: string;
  totalSales: number;
  totalProducts: number;
  items: ProductSalesSummary[];
}

export interface TopProductsReport {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  limit?: number;
  totalSales?: number;
  totalProducts?: number;
  items: ProductSalesSummary[];
}

export interface RevenueReport {
  startDate: string;
  endDate: string;
  totalSales: number;
  totalRevenue: string | number;
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly endpoint = `${environment.apiUrl}/sale/report`;

  constructor(private readonly http: HttpClient) {}

  getProductsSoldReport(startDate: string, endDate: string): Observable<ProductsSoldReport> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);

    return this.http.get<ProductsSoldReport>(`${this.endpoint}/products`, { params });
  }

  getTopProductsReport(
    period: ReportPeriod,
    startDate: string,
    endDate: string,
    limit = 10,
  ): Observable<TopProductsReport> {
    const params = new HttpParams()
      .set('period', period)
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('limit', limit);

    return this.http.get<TopProductsReport>(`${this.endpoint}/top-products`, { params });
  }

  getRevenueReport(startDate: string, endDate: string): Observable<RevenueReport> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);

    return this.http.get<RevenueReport>(`${this.endpoint}/revenue`, { params });
  }
}
