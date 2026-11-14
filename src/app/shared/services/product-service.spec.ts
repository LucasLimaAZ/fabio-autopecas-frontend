import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';

import { CreateProductPayload, Product, ProductService } from './product-service';

describe('ProductService', () => {
  let service: ProductService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a product with POST /product', () => {
    const product: CreateProductPayload = {
      name: 'Pastilha de freio',
      ref: 'PF-001',
      notes: 'Produto novo',
      cost_price: 25.5,
      sale_price: 49.9,
      amount: 10,
      minimum_amount: 2,
      category_id: 3,
    };

    service.createProduct(product).subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/product`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(product);
    request.flush({ id: 1, ...product });
  });

  it('should list a page of products with GET /product', () => {
    const response = {
      products: [
        {
          id: 1,
          name: 'Pastilha de freio',
          ref: 'PF-001',
          notes: null,
          cost_price: 25.5,
          sale_price: 49.9,
          amount: 10,
          minimum_amount: 2,
          category_id: 3,
          createdAt: '2026-03-24T13:42:30.000Z',
          updatedAt: '2026-03-24T13:42:30.000Z',
        },
      ],
      pagination: {
        page: 2,
        limit: 10,
        total: 21,
        totalPages: 3,
      },
    };

    service.getProducts(2, 10).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/product?page=2&limit=10`);
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should search products with GET /product/search', () => {
    const response: Product[] = [];

    service.searchProducts('filtro').subscribe((result) => {
      expect(result).toEqual(response);
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/product/search?term=filtro`);
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should update a product with PATCH /product/:id', () => {
    const updatedProduct: Product = {
      id: 5,
      name: 'Produto editado',
      ref: 'REF-005',
      notes: 'Atualizado',
      cost_price: 30,
      sale_price: 60,
      amount: 20,
      minimum_amount: 5,
      category_id: 2,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    };

    service.updateProduct(5, updatedProduct).subscribe((result) => {
      expect(result).toEqual(updatedProduct);
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/product/5`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(updatedProduct);
    request.flush(updatedProduct);
  });

  it('should delete a product with DELETE /product/:id', () => {
    service.deleteProduct(8).subscribe((result) => {
      expect(result).toBeNull();
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/product/8`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
