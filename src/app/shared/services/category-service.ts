import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface CreateCategoryPayload {
  name: string;
}

export interface Category {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly endpoint = `${environment.apiUrl}/category`;

  constructor(private readonly http: HttpClient) {}

  createCategory(category: CreateCategoryPayload): Observable<Category> {
    return this.http.post<Category>(this.endpoint, category);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.endpoint);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
