import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface CreateProductPayload {
  name: string;
  ref: string;
  notes: string | null;
  cost_price: number | null;
  sale_price: number | null;
  amount: number;
  minimum_amount: number;
  category_id: number;
}

export interface Product extends CreateProductPayload {
  id: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly endpoint = `${environment.apiUrl}/product`;

  constructor(private readonly http: HttpClient) {}

  createProduct(product: CreateProductPayload): Observable<Product> {
    return this.http.post<Product>(this.endpoint, product);
  }
}
