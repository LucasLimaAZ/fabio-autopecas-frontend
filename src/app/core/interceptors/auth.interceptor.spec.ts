import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.clear();
    httpTesting.verify();
  });

  it('should add the bearer token to requests', () => {
    localStorage.setItem('fabio-autopecas-token', 'token-123');

    http.get('/product').subscribe();

    const request = httpTesting.expectOne('/product');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token-123');
    request.flush({});
  });

  it('should not add authorization when there is no token', () => {
    http.get('/product').subscribe();

    const request = httpTesting.expectOne('/product');
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({});
  });
});
