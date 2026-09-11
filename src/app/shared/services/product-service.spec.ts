import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';

import { CreateProductPayload, ProductService } from './product-service';

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
});
