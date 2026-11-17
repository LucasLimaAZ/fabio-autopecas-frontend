import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';

export interface SaleItemPayload {
  product_id: number;
  quantity: number;
  unit_price?: number | string | null;
}

export interface SaleItem extends SaleItemPayload {
  subtotal?: string | number;
  createdAt?: string;
  updatedAt?: string;
  unit_price?: number | string | null;
}

export interface CreateSalePayload {
  sale_date?: string;
  notes?: string | null;
  items: SaleItemPayload[];
}

export interface Sale {
  id: number;
  user_id?: number;
  total_amount: number | string;
  sale_date?: string;
  notes?: string | null;
  items: SaleItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SalePage {
  sales: Sale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  private readonly endpoint = `${environment.apiUrl}/sale`;

  constructor(private readonly http: HttpClient) {}

  createSale(payload: CreateSalePayload): Observable<Sale> {
    return this.http.post<Sale>(this.endpoint, payload);
  }

  getSaleById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.endpoint}/${id}`);
  }

  getSales(page = 1, limit = 10): Observable<SalePage> {
    const params = new HttpParams().set('page', page).set('limit', limit);

    return this.http
      .get<Sale[] | SalePage>(this.endpoint, { params })
      .pipe(map((response) => this.normalizeSalesResponse(response, page, limit)));
  }

  private normalizeSalesResponse(
    response: Sale[] | SalePage,
    page: number,
    limit: number,
  ): SalePage {
    if (Array.isArray(response)) {
      const sales = response;
      const total = sales.length;

      return {
        sales,
        pagination: {
          page,
          limit,
          total,
          totalPages: total > 0 ? Math.ceil(total / limit) : 0,
        },
      };
    }

    const sales = Array.isArray(response?.sales) ? response.sales : [];
    const pagination = response?.pagination ?? {
      page,
      limit,
      total: sales.length,
      totalPages: sales.length > 0 ? Math.ceil(sales.length / limit) : 0,
    };

    return {
      sales,
      pagination: {
        page: Number(pagination.page ?? page),
        limit: Number(pagination.limit ?? limit),
        total: Number(pagination.total ?? sales.length),
        totalPages: Number(
          pagination.totalPages ?? (sales.length > 0 ? Math.ceil(sales.length / limit) : 0),
        ),
      },
    };
  }
}
