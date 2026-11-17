import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
  status?: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface ProductPage {
  products: Product[];
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
export class ProductService {
  private readonly endpoint = `${environment.apiUrl}/product`;

  constructor(private readonly http: HttpClient) {}

  createProduct(product: CreateProductPayload): Observable<Product> {
    return this.http.post<Product>(this.endpoint, product);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.endpoint}/${id}`);
  }

  getProducts(page = 1, limit = 10): Observable<ProductPage> {
    const params = new HttpParams().set('page', page).set('limit', limit);

    return this.http.get<ProductPage>(this.endpoint, { params });
  }

  searchProducts(term: string): Observable<Product[]> {
    const params = new HttpParams().set('term', term);

    return this.http.get<Product[]>(`${this.endpoint}/search`, { params });
  }

  updateProduct(id: number, product: CreateProductPayload): Observable<Product> {
    return this.http.patch<Product>(`${this.endpoint}/${id}`, product);
  }

  archiveProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
