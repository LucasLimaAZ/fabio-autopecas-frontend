import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(data: { email: string; password: string }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/auth/login`, data).pipe(
      tap((response) => {
        localStorage.setItem('fabio-autopecas-token', response.token);
      }),
    );
  }

  logout() {
    localStorage.removeItem('fabio-autopecas-token');
  }
}
