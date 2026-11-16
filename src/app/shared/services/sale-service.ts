import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface SaleItemPayload {
  product_id: number;
  quantity: number;
  unit_price?: number | null;
}

export interface CreateSalePayload {
  sale_date?: string;
  notes?: string | null;
  items: SaleItemPayload[];
}

export interface Sale extends CreateSalePayload {
  id: number;
  total_amount: number;
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
}
