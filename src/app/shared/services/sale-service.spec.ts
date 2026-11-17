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

  it('should list sales with pagination support from the API contract', () => {
    const salesResponse = [
      {
        id: 5,
        user_id: 2,
        total_amount: '79.80',
        sale_date: '2026-11-14',
        notes: 'Venda com entrega agendada',
        items: [
          {
            product_id: 10,
            quantity: 2,
            unit_price: '39.90',
            subtotal: '79.80',
            createdAt: '2026-11-17T00:16:57.472Z',
            updatedAt: '2026-11-17T00:16:57.472Z',
          },
        ],
        createdAt: '2026-11-17T00:16:57.472Z',
        updatedAt: '2026-11-17T00:16:57.472Z',
      },
    ];

    service.getSales(1, 10).subscribe((result) => {
      expect(result.sales).toEqual(salesResponse);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    const request = httpTesting.expectOne((req) => {
      return (
        req.url === `${environment.apiUrl}/sale` &&
        req.params.get('page') === '1' &&
        req.params.get('limit') === '10'
      );
    });

    expect(request.request.method).toBe('GET');
    request.flush(salesResponse);
  });

  it('should get a sale by id using the API contract', () => {
    const saleResponse = {
      id: 5,
      user_id: 2,
      total_amount: '79.80',
      sale_date: '2026-11-14',
      notes: 'Venda com entrega agendada',
      items: [
        {
          product_id: 10,
          quantity: 2,
          unit_price: '39.90',
          subtotal: '79.80',
          createdAt: '2026-11-17T00:23:02.560Z',
          updatedAt: '2026-11-17T00:23:02.560Z',
        },
      ],
      createdAt: '2026-11-17T00:23:02.560Z',
      updatedAt: '2026-11-17T00:23:02.560Z',
    };

    service.getSaleById(5).subscribe((result) => {
      expect(result).toEqual(saleResponse);
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/sale/5`);
    expect(request.request.method).toBe('GET');
    request.flush(saleResponse);
  });
});
