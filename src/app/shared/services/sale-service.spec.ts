import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';

import { CreateSalePayload, SaleService } from './sale-service';

describe('SaleService', () => {
  let service: SaleService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SaleService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a sale with POST /sale', () => {
    const payload: CreateSalePayload = {
      sale_date: '2026-11-14',
      notes: 'Venda com entrega agendada',
      items: [
        {
          product_id: 10,
          quantity: 2,
          unit_price: 29.9,
        },
      ],
    };

    service.createSale(payload).subscribe((result) => {
      expect(result).toEqual({ id: 1, ...payload, total_amount: 59.8 });
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/sale`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 1, ...payload, total_amount: 59.8 });
  });
});
